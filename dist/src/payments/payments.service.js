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
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    configService;
    socketGateway;
    notificationsService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, configService, socketGateway, notificationsService) {
        this.prisma = prisma;
        this.configService = configService;
        this.socketGateway = socketGateway;
        this.notificationsService = notificationsService;
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
        const { content, description, transferAmount, code, referenceCode, id } = payload;
        const memo = content || description || '';
        const transactionCode = `${code || referenceCode || id || ''}`;
        this.logger.log(`Received payment of ${transferAmount} with memo: "${memo}"`);
        const normalizedContent = this.removeAccents(memo);
        let order = null;
        order = await this.prisma.order.findFirst({
            where: {
                memo: { equals: normalizedContent, mode: 'insensitive' },
                status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PARTIALLY_PAID] }
            },
            include: {
                customer: true,
                items: { include: { course: true } }
            }
        });
        if (!order) {
            const pendingOrders = await this.prisma.order.findMany({
                where: {
                    status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PARTIALLY_PAID] }
                },
                include: {
                    customer: true,
                    items: { include: { course: true } }
                }
            });
            const matchesByCode = pendingOrders.filter(o => o.customer.code && normalizedContent.toUpperCase().includes(o.customer.code.toUpperCase()));
            if (matchesByCode.length > 0) {
                order = matchesByCode.find(o => o.finalPrice - o.paidAmount === transferAmount) || matchesByCode[0];
                this.logger.log(`Found order by Customer Code "${order.customer.code}" for customer ${order.customer.name}`);
            }
            else {
                const substringMatches = pendingOrders
                    .filter(o => o.memo && normalizedContent.toLowerCase().includes(this.removeAccents(o.memo).toLowerCase()))
                    .sort((a, b) => (b.memo?.length || 0) - (a.memo?.length || 0));
                if (substringMatches.length > 0) {
                    order = substringMatches[0];
                    this.logger.log(`Smart matched memo "${order.memo}" inside "${normalizedContent}"`);
                }
            }
        }
        if (!order) {
            const parts = normalizedContent.split(' ').filter(p => p.trim() !== '');
            if (parts.length >= 2) {
                const courseCode = parts[0].toUpperCase();
                const phone = parts[parts.length - 1];
                order = await this.prisma.order.findFirst({
                    where: {
                        status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PARTIALLY_PAID] },
                        customer: { phone: { contains: phone } },
                        items: {
                            some: {
                                course: { code: { equals: courseCode, mode: 'insensitive' } }
                            }
                        }
                    },
                    include: {
                        customer: true,
                        items: { include: { course: true } }
                    }
                });
            }
        }
        if (!order) {
            this.logger.warn(`No matching order found for normalized memo: ${normalizedContent}`);
            await updateLog('IGNORED');
            return { status: 'ignored', message: 'Order not found' };
        }
        try {
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
                        status: isFullPaid ? client_1.OrderStatus.PAID : client_1.OrderStatus.PARTIALLY_PAID
                    }
                });
            });
            await updateLog('SUCCESS');
            this.logger.log(`Successfully updated order ${order.id} for customer ${order.customer.name}`);
            this.socketGateway.emitPaymentReceived({
                orderId: order.id,
                customerId: order.customerId,
                customerName: order.customer.name,
                amount: transferAmount
            });
            const courseNames = order.items.map((i) => i.course.name).join(', ');
            await this.notificationsService.create({
                title: 'Thanh toán thành công',
                message: `Khách: ${order.customer.name} (${order.customer.phone}) - Khóa: ${courseNames} - Số tiền: ${new Intl.NumberFormat('vi-VN').format(transferAmount)}đ`,
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
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map