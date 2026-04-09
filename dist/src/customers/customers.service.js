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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let CustomersService = class CustomersService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(createCustomerDto, userId) {
        const existing = await this.prisma.customer.findUnique({
            where: { phone: createCustomerDto.phone },
        });
        if (existing) {
            throw new common_1.ConflictException('Số điện thoại này đã tồn tại trong danh sách khách hàng');
        }
        const lastCustomer = await this.prisma.customer.findFirst({
            where: { code: { startsWith: 'KH' } },
            orderBy: { code: 'desc' }
        });
        let nextCode = 'KH1000';
        if (lastCustomer && lastCustomer.code) {
            const lastNum = parseInt(lastCustomer.code.replace('KH', ''), 10);
            nextCode = `KH${lastNum + 1}`;
        }
        const newCustomer = await this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                code: nextCode,
                assignedSaleId: createCustomerDto.assignedSaleId || userId
            },
            include: {
                assignedSale: { select: { name: true } }
            }
        });
        await this.auditService.logAction({
            userId,
            action: 'CREATE_CUSTOMER',
            entityType: 'CUSTOMER',
            entityId: newCustomer.id,
            newData: {
                name: newCustomer.name,
                phone: newCustomer.phone,
                code: newCustomer.code
            }
        });
        return newCustomer;
    }
    async findAll(query) {
        const { search, skip = 0, take = 50 } = query || {};
        return this.prisma.customer.findMany({
            where: {
                deletedAt: null,
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { code: { contains: search, mode: 'insensitive' } },
                ] : undefined,
            },
            include: {
                assignedSale: {
                    select: { name: true }
                },
                orders: {
                    include: {
                        items: { include: { course: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                orders: {
                    include: {
                        items: { include: { course: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!customer) {
            throw new common_1.NotFoundException('Không tìm thấy khách hàng này');
        }
        return customer;
    }
    async update(id, updateCustomerDto, currentUser) {
        const customer = await this.findOne(id);
        if (updateCustomerDto.phone) {
            const existing = await this.prisma.customer.findUnique({
                where: { phone: updateCustomerDto.phone },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Số điện thoại này đã được sử dụng bởi khách hàng khác');
            }
        }
        if (updateCustomerDto.assignedSaleId && updateCustomerDto.assignedSaleId !== customer.assignedSaleId) {
            if (currentUser.role !== 'ADMIN') {
                throw new common_1.BadRequestException('Chỉ ADMIN mới có quyền thay đổi nhân viên phụ trách');
            }
        }
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }
    async softDelete(id) {
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map