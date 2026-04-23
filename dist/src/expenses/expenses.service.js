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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_CATEGORY_BY_TYPE = {
    ADVERTISING: 'MARKETING',
    OPERATIONS: 'OPERATIONS',
    EQUIPMENT: 'FACILITIES',
};
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExpenseDto, userId) {
        return this.prisma.systemExpense.create({
            data: {
                name: createExpenseDto.name,
                amount: createExpenseDto.amount,
                type: createExpenseDto.type,
                category: createExpenseDto.category ||
                    DEFAULT_CATEGORY_BY_TYPE[createExpenseDto.type] ||
                    'OTHER',
                subCategory: createExpenseDto.subCategory || createExpenseDto.type,
                costCenter: createExpenseDto.costCenter || 'OPERATIONS',
                paymentMethod: createExpenseDto.paymentMethod || 'BANK_TRANSFER',
                nature: createExpenseDto.nature || 'VARIABLE',
                vendorName: createExpenseDto.vendorName,
                referenceType: createExpenseDto.referenceType,
                referenceId: createExpenseDto.referenceId,
                notes: createExpenseDto.notes,
                date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
                createdById: userId,
            },
            include: {
                createdBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
    }
    async findAll(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { type: { contains: query.search, mode: 'insensitive' } },
                { subCategory: { contains: query.search, mode: 'insensitive' } },
                { vendorName: { contains: query.search, mode: 'insensitive' } },
                { notes: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.category)
            where.category = query.category;
        if (query.costCenter)
            where.costCenter = query.costCenter;
        if (query.status)
            where.status = query.status;
        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate)
                where.date.gte = query.startDate;
            if (query.endDate)
                where.date.lte = query.endDate;
        }
        const [items, total] = await Promise.all([
            this.prisma.systemExpense.findMany({
                where,
                include: {
                    createdBy: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, name: true } },
                },
                orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.systemExpense.count({ where }),
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async findOne(id) {
        const expense = await this.prisma.systemExpense.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Không tìm thấy khoản chi');
        }
        return expense;
    }
    async update(id, updateExpenseDto) {
        await this.findOne(id);
        return this.prisma.systemExpense.update({
            where: { id },
            data: {
                ...updateExpenseDto,
                category: updateExpenseDto.category ||
                    (updateExpenseDto.type
                        ? DEFAULT_CATEGORY_BY_TYPE[updateExpenseDto.type] || undefined
                        : undefined),
                subCategory: updateExpenseDto.subCategory || updateExpenseDto.type || undefined,
                date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
            },
            include: {
                createdBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
    }
    async confirm(id, approvedById) {
        const expense = await this.findOne(id);
        if (expense.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Không thể xác nhận khoản chi đã hủy');
        }
        return this.prisma.systemExpense.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date(),
                cancelledAt: null,
                approvedById: approvedById || expense.approvedById,
            },
            include: {
                createdBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
    }
    async cancel(id) {
        await this.findOne(id);
        return this.prisma.systemExpense.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
            },
            include: {
                createdBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.systemExpense.delete({
            where: { id },
        });
    }
    async getStats(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = startDate;
            if (endDate)
                where.date.lte = endDate;
        }
        where.status = 'CONFIRMED';
        const expenses = await this.prisma.systemExpense.findMany({ where });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const byCategory = expenses.reduce((acc, e) => {
            const category = e.category || 'OTHER';
            acc[category] = (acc[category] || 0) + e.amount;
            return acc;
        }, {});
        const byCostCenter = expenses.reduce((acc, e) => {
            const costCenter = e.costCenter || 'GENERAL';
            acc[costCenter] = (acc[costCenter] || 0) + e.amount;
            return acc;
        }, {});
        return {
            total,
            byCategory,
            byCostCenter,
            count: expenses.length,
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map