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
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const socket_gateway_1 = require("../socket/socket.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const audit_service_1 = require("../audit/audit.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    configService;
    socketGateway;
    notificationsService;
    auditService;
    logger = new common_1.Logger(PaymentsService_1.name);
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
                status: 'RECEIVED'
            }
        });
        const updateLog = async (status) => {
            const updatedLog = await this.prisma.webhookLog.update({
                where: { id: log.id },
                data: { status }
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
        const { content, description, transferAmount, code, referenceCode, id, accountName } = payload;
        const memo = content || description || '';
        const transactionCode = `${code || referenceCode || id || ''}`;
        this.logger.log(`Received payment of ${transferAmount} with memo: "${memo}" from ${accountName || 'Unknown'}`);
        const normalizedContent = this.removeAccents(memo);
        let order = null;
        const pendingOrders = await this.prisma.order.findMany({
            where: {
                status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PARTIALLY_PAID] }
            },
            include: {
                customer: true,
                items: { include: { course: true } }
            }
        });
        const findStrictMatch = () => {
            for (const o of pendingOrders) {
                const normalizedCustCode = this.removeAccents(o.customer.code || '').toUpperCase();
                const hasCode = o.customer.code && normalizedContent.toUpperCase().includes(normalizedCustCode);
                const hasPhone = o.customer.phone && normalizedContent.includes(o.customer.phone);
                const hasCourseCode = o.items.some(item => {
                    const normalizedItemCourseCode = this.removeAccents(item.course.code || '').toUpperCase();
                    return normalizedItemCourseCode && normalizedContent.toUpperCase().includes(normalizedItemCourseCode);
                });
                if (hasCode && hasPhone && hasCourseCode) {
                    return o;
                }
            }
            return null;
        };
        order = findStrictMatch();
        if (order) {
            this.logger.log(`Strict match found for order ${order.id} (Customer: ${order.customer.code}, Phone: ${order.customer.phone})`);
        }
        else {
            this.logger.warn(`No strict match for memo: "${normalizedContent}"`);
            const systemAdmin = await this.prisma.user.findFirst({
                where: { role: { name: 'ADMIN' } }
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
                        reason: 'Nội dung không khớp đủ 3 yếu tố [Mã KH], [SĐT], [Mã Khóa]'
                    }
                });
            }
            await updateLog('MANUAL_REVIEW');
            return { status: 'manual_review', message: 'Strict matching failed, manual review required' };
        }
        if (!order) {
            this.logger.warn(`No matching order found for normalized memo: ${normalizedContent}`);
            await updateLog('IGNORED');
            return { status: 'ignored', message: 'Order not found' };
        }
        try {
            let finalCustomerName = order.customer.name;
            await this.prisma.$transaction(async (tx) => {
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        amount: transferAmount,
                        transactionCode: transactionCode,
                        rawData: payload,
                        status: 'SUCCESS'
                    }
                });
                const newPaidAmount = order.paidAmount + transferAmount;
                const isFullPaid = newPaidAmount >= order.finalPrice;
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paidAmount: newPaidAmount,
                        status: isFullPaid ? client_1.OrderStatus.PAID : client_1.OrderStatus.PARTIALLY_PAID,
                        isLead: false
                    }
                });
                if (accountName && (order.customer.name.includes('Khách vãng lai') || order.customer.name === order.customer.phone)) {
                    finalCustomerName = accountName.toUpperCase();
                    await tx.customer.update({
                        where: { id: order.customerId },
                        data: { name: finalCustomerName }
                    });
                }
            });
            await updateLog('SUCCESS');
            this.socketGateway.emitPaymentReceived({
                orderId: order.id,
                customerId: order.customerId,
                customerName: finalCustomerName,
                amount: transferAmount
            });
            const courseNames = order.items.map((i) => i.course.name).join(', ');
            await this.notificationsService.create({
                title: 'Thanh toán thành công',
                message: `Khách: ${finalCustomerName} - Khóa: ${courseNames} - Số tiền: ${new Intl.NumberFormat('vi-VN').format(transferAmount)}đ`,
                type: 'SUCCESS'
            });
            return { status: 'success' };
        }
        catch (error) {
            this.logger.error(`Error processing payment for order ${order.id}:`, error);
            await updateLog('ERROR');
            throw error;
        }
    }
    async getWebhookLogs() {
        return this.prisma.webhookLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
    async findAllPayments() {
        return this.prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    include: {
                        customer: true,
                        items: { include: { course: true } }
                    }
                }
            }
        });
    }
    removeAccents(str) {
        if (!str)
            return '';
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    }
    async getWebhookSettings() {
        return {
            url: `${this.configService.get('SERVER_URL') || 'http://localhost:3001'}/payments/webhook/sepay`,
            secret: this.configService.get('SEPAY_WEBHOOK_SECRET'),
            bankInfo: {
                id: this.configService.get('BANK_ID'),
                accountNo: this.configService.get('BANK_ACCOUNT_NO'),
                accountName: this.configService.get('BANK_ACCOUNT_NAME'),
            }
        };
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