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
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExpenseDto) {
        return this.prisma.systemExpense.create({
            data: {
                ...createExpenseDto,
                date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
            },
        });
    }
    async findAll() {
        return this.prisma.systemExpense.findMany({
            orderBy: { date: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.systemExpense.findUnique({
            where: { id },
        });
    }
    async remove(id) {
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
        const expenses = await this.prisma.systemExpense.findMany({ where });
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const byType = expenses.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + e.amount;
            return acc;
        }, {});
        return {
            total,
            byType,
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