"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const prisma_service_1 = require("../prisma/prisma.service");
const socket_gateway_1 = require("../socket/socket.gateway");
let PaymentsService = class PaymentsService {
    static { PaymentsService_1 = this; }
    prisma;
    configService;
    socketGateway;
    notificationsService;
    auditService;
    logger = new common_1.Logger(PaymentsService_1.name);
    static LP_NOTE_PREFIX = 'Khach tu dong tao tu landing page';
    constructor(prisma, configService, socketGateway, notificationsService, auditService) {
        this.prisma = prisma;
        this.configService = configService;
        this.socketGateway = socketGateway;
        this.notificationsService = notificationsService;
        this.auditService = auditService;
    }
    async handleSePayWebhook(payload, authHeader) {
        const log = await this.prisma.webhookLog.create({
            data: {
                payload,
                status: 'RECEIVED',
            },
        });
        const updateLog = async (status) => {
            const updatedLog = await this.prisma.webhookLog.update({
                where: { id: log.id },
                data: { status },
            });
            this.socketGateway.emitWebhookLogUpdated(updatedLog);
        };
        this.socketGateway.emitWebhookLogUpdated(log);
        const secret = this.configService.get('SEPAY_WEBHOOK_SECRET');
        const isValid = authHeader === `Apikey ${secret}` || authHeader === `Bearer ${secret}`;
        if (!isValid) {
            this.logger.error('Unauthorized SePay Webhook attempt: Invalid secret or prefix');
            await updateLog('UNAUTHORIZED');
            throw new common_1.UnauthorizedException('Invalid Webhook Secret');
        }
        const { content, description, transferAmount, code, referenceCode, id, accountName, transferType } = payload;
        const memo = content || description || '';
        const transactionCode = `${code || referenceCode || id || ''}`;
        this.logger.log(`Received ${transferType || 'unknown'} transaction of ${transferAmount} with memo: "${memo}" from ${accountName || 'Unknown'}`);
        if (transferType && transferType !== 'in') {
            this.logger.warn(`Ignoring non-incoming transaction ${transactionCode} with transferType=${transferType}`);
            await updateLog('OUTFLOW');
            return { status: 'ignored', message: 'Outgoing transaction ignored' };
        }
        const existingPayment = transactionCode
            ? await this.prisma.payment.findUnique({
                where: { transactionCode },
                include: {
                    order: {
                        include: {
                            customer: true,
                        },
                    },
                },
            })
            : null;
        if (existingPayment) {
            this.logger.warn(`Duplicate SePay webhook ignored for transaction ${transactionCode}`);
            await updateLog('DUPLICATE');
            return {
                status: 'duplicate',
                message: 'Transaction already processed',
                orderId: existingPayment.orderId,
            };
        }
        const normalizedContent = this.removeAccents(memo);
        const landingPageMemo = this.parseLandingPageMemo(memo);
        if (landingPageMemo) {
            return this.handleLandingPageWebhook({
                payload,
                logId: log.id,
                lpMemo: landingPageMemo,
                transferAmount,
                transactionCode,
                updateLog,
            });
        }
        let order = null;
        const pendingOrders = await this.prisma.order.findMany({
            where: {
                status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PARTIALLY_PAID] },
            },
            include: {
                customer: true,
                items: { include: { course: true } },
            },
        });
        const findStrictMatch = () => {
            for (const pendingOrder of pendingOrders) {
                const normalizedCustomerCode = this.removeAccents(pendingOrder.customer.code || '').toUpperCase();
                const hasCode = pendingOrder.customer.code && normalizedContent.toUpperCase().includes(normalizedCustomerCode);
                const hasPhone = pendingOrder.customer.phone && normalizedContent.includes(pendingOrder.customer.phone);
                const hasCourseCode = pendingOrder.items.some((item) => {
                    const normalizedCourseCode = this.removeAccents(item.course.code || '').toUpperCase();
                    return normalizedCourseCode && normalizedContent.toUpperCase().includes(normalizedCourseCode);
                });
                if (hasCode && hasPhone && hasCourseCode) {
                    return pendingOrder;
                }
            }
            return null;
        };
        const findMemoMatch = () => {
            const cleanWebhookContent = normalizedContent.replace(/\s+/g, '').toUpperCase();
            for (const pendingOrder of pendingOrders) {
                if (!pendingOrder.memo) {
                    continue;
                }
                const cleanSystemMemo = this.removeAccents(pendingOrder.memo)
                    .replace(/\s+/g, '')
                    .toUpperCase();
                if (cleanSystemMemo && cleanWebhookContent.includes(cleanSystemMemo)) {
                    return pendingOrder;
                }
            }
            return null;
        };
        order = findStrictMatch();
        if (order) {
            this.logger.log(`[STRICT_MATCH] Order found: ${order.id} (Customer: ${order.customer.code})`);
        }
        else {
            this.logger.warn(`No strict match for memo: "${normalizedContent}". Trying fallback memo match...`);
            order = findMemoMatch();
            if (order) {
                this.logger.log(`[MEMO_MATCH] Fallback match found for order ${order.id} via stored memo`);
            }
        }
        if (!order) {
            this.logger.error(`[MATCH_FAILED] No matching order found for memo: "${normalizedContent}"`);
            const systemAdmin = await this.prisma.user.findFirst({
                where: { role: { name: 'ADMIN' } },
            });
            if (systemAdmin) {
                await this.auditService.logAction({
                    userId: systemAdmin.id,
                    action: 'PAYMENT_MISMATCH',
                    entityType: 'WEBHOOK',
                    entityId: log.id,
                    newData: {
                        memo: normalizedContent,
                        amount: transferAmount,
                        reason: 'No strict order match and no fallback memo match.',
                    },
                });
            }
            await updateLog('MANUAL_REVIEW');
            return { status: 'manual_review', message: 'Matching failed, manual review required' };
        }
        try {
            let finalCustomerName = order.customer.name;
            await this.prisma.$transaction(async (tx) => {
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        amount: transferAmount,
                        transactionCode,
                        rawData: payload,
                        status: client_1.PaymentStatus.SUCCESS,
                    },
                });
                const newPaidAmount = order.paidAmount + transferAmount;
                const isFullPaid = newPaidAmount >= order.finalPrice;
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paidAmount: newPaidAmount,
                        status: isFullPaid ? client_1.OrderStatus.PAID : client_1.OrderStatus.PARTIALLY_PAID,
                        isLead: false,
                    },
                });
                if (accountName &&
                    (!order.customer.name ||
                        order.customer.name.includes('Khach vang lai') ||
                        order.customer.name === order.customer.phone)) {
                    finalCustomerName = accountName.toUpperCase();
                    await tx.customer.update({
                        where: { id: order.customerId },
                        data: { name: finalCustomerName },
                    });
                }
            });
            await updateLog('SUCCESS');
            this.socketGateway.emitPaymentReceived({
                orderId: order.id,
                customerId: order.customerId,
                customerName: finalCustomerName,
                amount: transferAmount,
            });
            const courseNames = order.items.map((item) => item.course.name).join(', ');
            await this.notificationsService.create({
                title: 'Thanh toan thanh cong',
                message: `Khach: ${finalCustomerName} - Khoa: ${courseNames} - So tien: ${new Intl.NumberFormat('vi-VN').format(transferAmount)}d`,
                type: 'SUCCESS',
            });
            return { status: 'success' };
        }
        catch (error) {
            this.logger.error(`Error processing payment for order ${order.id}:`, error);
            await updateLog('ERROR');
            throw error;
        }
    }
    async getWebhookLogs(query) {
        const page = Math.max(1, query?.page || 1);
        const limit = Math.min(100, Math.max(10, query?.limit || 20));
        const offset = (page - 1) * limit;
        const conditions = [];
        if (query?.status && query.status !== 'ALL') {
            conditions.push(client_1.Prisma.sql `status = ${query.status}`);
        }
        if (query?.transferType && query.transferType !== 'ALL') {
            conditions.push(client_1.Prisma.sql `payload::jsonb ->> 'transferType' = ${query.transferType}`);
        }
        if (query?.search?.trim()) {
            const keyword = `%${query.search.trim()}%`;
            conditions.push(client_1.Prisma.sql `(
          COALESCE(payload::jsonb ->> 'content', '') ILIKE ${keyword}
          OR COALESCE(payload::jsonb ->> 'description', '') ILIKE ${keyword}
          OR COALESCE(payload::jsonb ->> 'referenceCode', '') ILIKE ${keyword}
        )`);
        }
        const combinedConditions = conditions.reduce((acc, condition, index) => (index === 0 ? condition : client_1.Prisma.sql `${acc} AND ${condition}`), client_1.Prisma.empty);
        const whereClause = conditions.length > 0 ? client_1.Prisma.sql `WHERE ${combinedConditions}` : client_1.Prisma.empty;
        const [items, totalResult] = await Promise.all([
            this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT id, source, payload, status, "retryCount", "createdAt"
        FROM "WebhookLog"
        ${whereClause}
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `),
            this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT COUNT(*)::bigint AS total
        FROM "WebhookLog"
        ${whereClause}
      `),
        ]);
        return {
            items,
            total: Number(totalResult[0]?.total || 0),
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(Number(totalResult[0]?.total || 0) / limit)),
        };
    }
    async findAllPayments() {
        return this.prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    include: {
                        customer: true,
                        items: { include: { course: true } },
                    },
                },
            },
        });
    }
    async getWebhookSettings() {
        return {
            url: `${this.configService.get('SERVER_URL') || 'http://localhost:3001'}/payments/webhook/sepay`,
            secret: this.configService.get('SEPAY_WEBHOOK_SECRET'),
            bankInfo: {
                id: this.configService.get('BANK_ID'),
                accountNo: this.configService.get('BANK_ACCOUNT_NO'),
                accountName: this.configService.get('BANK_ACCOUNT_NAME'),
            },
        };
    }
    async handleLandingPageWebhook(params) {
        const { payload, logId, lpMemo, transferAmount, transactionCode, updateLog } = params;
        if (!lpMemo.isValid) {
            this.logger.warn(`Invalid LP webhook format: ${lpMemo.rawMemo} (${lpMemo.error})`);
            await updateLog('INVALID_FORMAT');
            return {
                status: 'manual_review',
                message: 'Invalid landing page transfer format',
            };
        }
        const automationUser = await this.getAutomationUser();
        if (!automationUser) {
            this.logger.error('Cannot process LP webhook because no system user was found');
            await updateLog('MANUAL_REVIEW');
            return {
                status: 'manual_review',
                message: 'No automation user available',
            };
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                let course = await tx.course.findUnique({
                    where: { code: lpMemo.courseCode },
                });
                let createdCourse = false;
                if (course?.deletedAt) {
                    course = await tx.course.update({
                        where: { id: course.id },
                        data: {
                            deletedAt: null,
                            status: 'ACTIVE',
                        },
                    });
                }
                if (!course) {
                    course = await tx.course.create({
                        data: {
                            code: lpMemo.courseCode,
                            name: `Khoa LP - ${lpMemo.courseCode}`,
                            price: transferAmount,
                            duration: 0,
                            totalSessions: 0,
                            description: `Tu dong tao tu webhook landing page. Memo: ${lpMemo.rawMemo}`,
                            status: 'ACTIVE',
                        },
                    });
                    createdCourse = true;
                }
                let customer = await tx.customer.findUnique({
                    where: { phone: lpMemo.phone },
                });
                let createdCustomer = false;
                if (!customer) {
                    const nextCode = await this.generateNextCustomerCode(tx);
                    customer = await tx.customer.create({
                        data: {
                            code: nextCode,
                            name: lpMemo.customerName,
                            phone: lpMemo.phone,
                            source: 'landing_page',
                            assignedSaleId: automationUser.id,
                            notes: `${PaymentsService_1.LP_NOTE_PREFIX}. Memo: ${lpMemo.rawMemo}`,
                        },
                    });
                    createdCustomer = true;
                }
                else {
                    const customerUpdates = {};
                    if (customer.deletedAt) {
                        customerUpdates.deletedAt = null;
                    }
                    if (!customer.source) {
                        customerUpdates.source = 'landing_page';
                    }
                    if (!customer.assignedSaleId) {
                        customerUpdates.assignedSale = {
                            connect: { id: automationUser.id },
                        };
                    }
                    const normalizedExistingName = this.removeAccents(customer.name || '')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .toUpperCase();
                    const normalizedIncomingName = this.removeAccents(lpMemo.customerName)
                        .replace(/\s+/g, ' ')
                        .trim()
                        .toUpperCase();
                    if (!normalizedExistingName) {
                        customerUpdates.name = lpMemo.customerName;
                    }
                    else if (normalizedExistingName !== normalizedIncomingName) {
                        const mismatchNote = `Ten tu giao dich LP: ${lpMemo.customerName}`;
                        customerUpdates.notes = customer.notes
                            ? customer.notes.includes(mismatchNote)
                                ? customer.notes
                                : `${customer.notes}\n${mismatchNote}`
                            : mismatchNote;
                    }
                    if (Object.keys(customerUpdates).length > 0) {
                        customer = await tx.customer.update({
                            where: { id: customer.id },
                            data: customerUpdates,
                        });
                    }
                }
                const existingPaidOrder = await tx.order.findFirst({
                    where: {
                        customerId: customer.id,
                        status: client_1.OrderStatus.PAID,
                        items: {
                            some: { courseId: course.id },
                        },
                    },
                });
                if (existingPaidOrder) {
                    throw new Error('CUSTOMER_ALREADY_PURCHASED_COURSE');
                }
                const order = await tx.order.create({
                    data: {
                        customerId: customer.id,
                        saleId: automationUser.id,
                        totalPrice: transferAmount,
                        finalPrice: transferAmount,
                        paidAmount: transferAmount,
                        status: client_1.OrderStatus.PAID,
                        memo: lpMemo.rawMemo,
                        memoEditable: false,
                        locked: true,
                        invoiceIssued: false,
                        isLead: false,
                        items: {
                            create: [
                                {
                                    courseId: course.id,
                                    price: transferAmount,
                                },
                            ],
                        },
                    },
                    include: {
                        customer: true,
                        items: { include: { course: true } },
                    },
                });
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        amount: transferAmount,
                        transactionCode,
                        rawData: payload,
                        status: client_1.PaymentStatus.SUCCESS,
                    },
                });
                return {
                    order,
                    customer,
                    course,
                    createdCourse,
                    createdCustomer,
                };
            });
            await this.auditService.logAction({
                userId: automationUser.id,
                action: 'AUTO_CREATE_LP_ORDER',
                entityType: 'ORDER',
                entityId: result.order.id,
                newData: {
                    customerId: result.customer.id,
                    customerName: result.customer.name,
                    phone: result.customer.phone,
                    courseId: result.course.id,
                    courseCode: result.course.code,
                    amount: transferAmount,
                    transactionCode,
                    createdCourse: result.createdCourse,
                    createdCustomer: result.createdCustomer,
                    webhookLogId: logId,
                },
            });
            await updateLog('AUTO_CREATED');
            if (result.createdCustomer) {
                this.socketGateway.emitCustomerCreated(result.customer);
            }
            this.socketGateway.emitPaymentReceived({
                orderId: result.order.id,
                customerId: result.customer.id,
                customerName: result.customer.name,
                amount: transferAmount,
            });
            await this.notificationsService.create({
                title: 'Thanh toan tu landing page',
                message: `Khach: ${result.customer.name} - Khoa: ${result.course.name} - So tien: ${new Intl.NumberFormat('vi-VN').format(transferAmount)}d`,
                type: 'SUCCESS',
            });
            return {
                status: 'success',
                mode: 'landing_page',
                orderId: result.order.id,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                this.logger.warn(`Duplicate LP transaction ignored for ${transactionCode}`);
                await updateLog('DUPLICATE');
                return {
                    status: 'duplicate',
                    message: 'Duplicate LP transaction',
                };
            }
            if (error?.message === 'CUSTOMER_ALREADY_PURCHASED_COURSE') {
                this.logger.warn(`LP webhook requires manual review because customer ${lpMemo.phone} already has paid order for ${lpMemo.courseCode}`);
                await updateLog('MANUAL_REVIEW');
                return {
                    status: 'manual_review',
                    message: 'Customer already purchased this course',
                };
            }
            this.logger.error(`Error processing LP webhook ${transactionCode}:`, error);
            await updateLog('ERROR');
            throw error;
        }
    }
    parseLandingPageMemo(memo) {
        const rawMemo = this.removeAccents(memo || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();
        if (!rawMemo.startsWith('LP ')) {
            return null;
        }
        const parts = rawMemo.split(' ');
        if (parts.length < 4) {
            return {
                rawMemo,
                isValid: false,
                error: 'Missing course code, phone, or customer name',
            };
        }
        const [, courseCode, rawPhone, ...nameParts] = parts;
        const phone = rawPhone.replace(/\D/g, '');
        const customerName = nameParts.join(' ').trim();
        if (!courseCode || !phone || !customerName) {
            return {
                rawMemo,
                isValid: false,
                error: 'Missing course code, phone, or customer name',
            };
        }
        if (!/^(0|\+?84)\d{8,10}$/.test(phone)) {
            return {
                rawMemo,
                isValid: false,
                error: 'Invalid phone format',
            };
        }
        return {
            rawMemo,
            isValid: true,
            courseCode,
            phone,
            customerName,
        };
    }
    async getAutomationUser() {
        const admin = await this.prisma.user.findFirst({
            where: {
                role: {
                    name: 'ADMIN',
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        if (admin) {
            return admin;
        }
        return this.prisma.user.findFirst({
            orderBy: { createdAt: 'asc' },
        });
    }
    async generateNextCustomerCode(tx) {
        const lastCustomer = await tx.customer.findFirst({
            where: { code: { startsWith: 'KH' } },
            orderBy: { code: 'desc' },
        });
        let nextCode = 'KH1000';
        if (lastCustomer?.code) {
            const lastNum = parseInt(lastCustomer.code.replace('KH', ''), 10);
            nextCode = `KH${lastNum + 1}`;
        }
        return nextCode;
    }
    removeAccents(str) {
        if (!str) {
            return '';
        }
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        socket_gateway_1.SocketGateway,
        notifications_service_1.NotificationsService,
        audit_service_1.AuditService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map