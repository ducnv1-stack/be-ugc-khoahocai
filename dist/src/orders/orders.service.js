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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const create_order_dto_1 = require("./dto/create-order.dto");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../audit/audit.service");
const customers_service_1 = require("../customers/customers.service");
const socket_gateway_1 = require("../socket/socket.gateway");
let OrdersService = class OrdersService {
    prisma;
    configService;
    auditService;
    customersService;
    socketGateway;
    constructor(prisma, configService, auditService, customersService, socketGateway) {
        this.prisma = prisma;
        this.configService = configService;
        this.auditService = auditService;
        this.customersService = customersService;
        this.socketGateway = socketGateway;
    }
    async create(createOrderDto, saleId) {
        const { customerId, customerName, customerPhone, customerCccd, customerAddress, courseIds, discountType, discountValue, paymentAmount, primaryCourseId, customerNotes } = createOrderDto;
        let targetCustomerId = customerId;
        let isLead = false;
        if (!targetCustomerId) {
            if (!customerPhone)
                throw new common_1.BadRequestException('Vui lòng cung cấp customerId hoặc customerPhone');
            let customer = await this.prisma.customer.findUnique({ where: { phone: customerPhone } });
            if (!customer) {
                const nextCode = await this.customersService.generateNextCode();
                customer = await this.prisma.customer.create({
                    data: {
                        code: nextCode,
                        name: customerName || `Khách vãng lai ${customerPhone}`,
                        phone: customerPhone,
                        cccd: customerCccd,
                        address: customerAddress,
                        assignedSaleId: saleId,
                        notes: customerNotes || 'Khách hàng tạo nhanh từ luồng QR'
                    }
                });
            }
            else {
                if (customerCccd || customerAddress) {
                    customer = await this.prisma.customer.update({
                        where: { id: customer.id },
                        data: {
                            ...(customerCccd && { cccd: customerCccd }),
                            ...(customerAddress && { address: customerAddress })
                        }
                    });
                }
            }
            targetCustomerId = customer.id;
            isLead = true;
        }
        const customer = await this.prisma.customer.findUnique({
            where: { id: targetCustomerId },
        });
        if (!customer)
            throw new common_1.NotFoundException('Không tìm thấy khách hàng');
        const courses = await this.prisma.course.findMany({
            where: { id: { in: courseIds } },
        });
        if (courses.length !== courseIds.length) {
            throw new common_1.BadRequestException('Một hoặc nhiều khóa học không tồn tại');
        }
        const totalPrice = courses.reduce((acc, curr) => acc + curr.price, 0);
        let finalPrice = totalPrice;
        let prismaDiscountType = null;
        if (discountType) {
            prismaDiscountType = discountType === create_order_dto_1.DiscountType.PERCENT ? client_1.DiscountType.PERCENT : client_1.DiscountType.FIXED;
            const val = discountValue || 0;
            if (prismaDiscountType === client_1.DiscountType.PERCENT) {
                finalPrice = totalPrice * (1 - val / 100);
            }
            else {
                finalPrice = Math.max(0, totalPrice - val);
            }
        }
        let primaryCourse = courses.find(c => c.id === primaryCourseId);
        if (!primaryCourse && courses.length > 0) {
            primaryCourse = courses[0];
        }
        const rawMemo = `${customer.code || ''} ${customer.phone} ${primaryCourse?.code || 'UGC'}`.toUpperCase();
        const memo = this.removeAccents(rawMemo).trim();
        const amountToPay = paymentAmount || finalPrice;
        const qrUrl = this.generateQrUrl(amountToPay, memo);
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    customerId: targetCustomerId,
                    saleId,
                    totalPrice,
                    discountType: prismaDiscountType,
                    discountValue: discountValue || 0,
                    finalPrice,
                    paidAmount: 0,
                    status: client_1.OrderStatus.PENDING,
                    qrCode: qrUrl,
                    memo,
                    memoEditable: true,
                    isLead,
                    items: {
                        create: courses.map(c => ({
                            courseId: c.id,
                            price: c.price,
                        }))
                    }
                },
                include: {
                    items: { include: { course: true } },
                    customer: true
                }
            });
            return newOrder;
        });
        await this.auditService.logAction({
            userId: saleId,
            action: isLead ? 'QUICK_CREATE_ORDER' : 'CREATE_ORDER',
            entityType: 'ORDER',
            entityId: order.id,
            newData: {
                totalPrice: order.totalPrice,
                finalPrice: order.finalPrice,
                isLead,
                courses: courses.map(c => c.code).join(', '),
                context: {
                    customerName: order.customer?.name,
                    customerPhone: order.customer?.phone,
                }
            }
        });
        if (isLead) {
            this.socketGateway.emitCustomerCreated(order.customer || order);
        }
        return order;
    }
    findAll() {
        return this.prisma.order.findMany({
            include: {
                customer: { select: { name: true, phone: true } },
                items: { include: { course: true } },
                sale: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { course: true } },
                payments: true,
                sale: { select: { name: true } }
            }
        });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        return order;
    }
    async updateMemo(id, newMemo) {
        const order = await this.findOne(id);
        if (!order)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        const normalizedMemo = this.removeAccents(newMemo).toUpperCase().trim();
        const amountToPay = order.finalPrice - order.paidAmount;
        const newQrUrl = this.generateQrUrl(amountToPay, normalizedMemo);
        return this.prisma.order.update({
            where: { id },
            data: {
                memo: normalizedMemo,
                qrCode: newQrUrl
            }
        });
    }
    async updatePrice(id, data, userId) {
        const order = await this.findOne(id);
        if (!order)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        const { discountType, discountValue, finalPrice } = data;
        let newStatus = client_1.OrderStatus.PENDING;
        if (order.paidAmount >= finalPrice) {
            newStatus = client_1.OrderStatus.PAID;
        }
        else if (order.paidAmount > 0) {
            newStatus = client_1.OrderStatus.PARTIALLY_PAID;
        }
        const remainingToPay = Math.max(0, finalPrice - order.paidAmount);
        const newQrUrl = this.generateQrUrl(remainingToPay, order.memo);
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                discountType,
                discountValue,
                finalPrice,
                status: newStatus,
                qrCode: newQrUrl
            }
        });
        await this.auditService.logAction({
            userId,
            action: 'UPDATE_ORDER_PRICE',
            entityType: 'ORDER',
            entityId: id,
            oldData: {
                finalPrice: order.finalPrice,
                discountType: order.discountType,
                discountValue: order.discountValue,
                context: {
                    customerName: order.customer?.name,
                    customerPhone: order.customer?.phone,
                    customerCode: order.customer?.code
                }
            },
            newData: { finalPrice, discountType, discountValue },
        });
        return updatedOrder;
    }
    async updatePaidAmount(id, paidAmount, userId) {
        const order = await this.findOne(id);
        if (!order)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        let newStatus = client_1.OrderStatus.PENDING;
        if (paidAmount >= order.finalPrice) {
            newStatus = client_1.OrderStatus.PAID;
        }
        else if (paidAmount > 0) {
            newStatus = client_1.OrderStatus.PARTIALLY_PAID;
        }
        const remainingToPay = Math.max(0, order.finalPrice - paidAmount);
        const newQrUrl = this.generateQrUrl(remainingToPay, order.memo);
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: {
                paidAmount,
                status: newStatus,
                qrCode: newQrUrl
            }
        });
        await this.auditService.logAction({
            userId,
            action: 'UPDATE_PAID_AMOUNT',
            entityType: 'ORDER',
            entityId: id,
            oldData: {
                paidAmount: order.paidAmount,
                status: order.status,
                context: {
                    customerName: order.customer?.name,
                    customerPhone: order.customer?.phone,
                    customerCode: order.customer?.code
                }
            },
            newData: { paidAmount, status: newStatus },
        });
        return updatedOrder;
    }
    async updateInvoiceStatus(id, invoiceIssued, userId) {
        const order = await this.findOne(id);
        if (!order)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: { invoiceIssued }
        });
        await this.auditService.logAction({
            userId,
            action: 'UPDATE_INVOICE_STATUS',
            entityType: 'ORDER',
            entityId: id,
            oldData: {
                invoiceIssued: order.invoiceIssued,
                context: {
                    customerName: order.customer?.name,
                    customerPhone: order.customer?.phone,
                    customerCode: order.customer?.code
                }
            },
            newData: { invoiceIssued },
        });
        return updatedOrder;
    }
    async remove(id, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { customer: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        return this.prisma.$transaction(async (tx) => {
            await tx.orderItem.deleteMany({ where: { orderId: id } });
            await tx.orderHistory.deleteMany({ where: { orderId: id } });
            await tx.payment.deleteMany({ where: { orderId: id } });
            await tx.refund.deleteMany({ where: { orderId: id } });
            const deletedOrder = await tx.order.delete({
                where: { id }
            });
            await this.auditService.logAction({
                userId,
                action: 'DELETE_ORDER',
                entityType: 'ORDER',
                entityId: id,
                oldData: {
                    status: order.status,
                    total: order.totalPrice,
                    context: {
                        customerName: order.customer?.name,
                        customerPhone: order.customer?.phone,
                        customerCode: order.customer?.code
                    }
                },
            });
            return deletedOrder;
        });
    }
    removeAccents(str) {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    }
    generateQrUrl(amount, memo) {
        const bankId = this.configService.get('BANK_ID') || 'MB';
        const accountNo = this.configService.get('BANK_ACCOUNT_NO') || '0000000000';
        const accountName = this.configService.get('BANK_ACCOUNT_NAME') || '';
        const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png`;
        const params = new URLSearchParams({
            amount: Math.round(amount).toString(),
            addInfo: memo,
            accountName: accountName
        });
        return `${baseUrl}?${params.toString()}`;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        customers_service_1.CustomersService,
        socket_gateway_1.SocketGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map