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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const totalCustomers = await this.prisma.customer.count({ where: { deletedAt: null } });
        const lastMonthCustomers = await this.prisma.customer.count({
            where: { deletedAt: null, createdAt: { lt: startOfMonth } }
        });
        const customerGrowth = lastMonthCustomers > 0
            ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
            : '0';
        const ordersToday = await this.prisma.order.count({
            where: { createdAt: { gte: startOfToday } }
        });
        const cashflowThisMonthAgg = await this.prisma.order.aggregate({
            where: { createdAt: { gte: startOfMonth } },
            _sum: { paidAmount: true }
        });
        const cashflowThisMonth = cashflowThisMonthAgg._sum.paidAmount || 0;
        const revenueStats = await this.prisma.$queryRaw `
      SELECT 
        SUM(CASE WHEN c."totalSessions" > 0 THEN (o."finalPrice" / c."totalSessions") ELSE 0 END) as "realRevenue"
      FROM "ScheduleStudent" ss
      JOIN "Schedule" s ON ss."scheduleId" = s.id
      JOIN "Course" c ON s."courseId" = c.id
      JOIN "Order" o ON o."customerId" = ss."customerId"
      JOIN "OrderItem" oi ON oi."orderId" = o.id AND oi."courseId" = c.id
      WHERE ss."isAttended" = true 
      AND s."startTime" >= ${startOfMonth}
    `;
        const realRevenue = revenueStats[0]?.realRevenue || 0;
        const expensesThisMonthAgg = await this.prisma.systemExpense.aggregate({
            where: { date: { gte: startOfMonth }, status: 'CONFIRMED' },
            _sum: { amount: true }
        });
        const expensesThisMonth = expensesThisMonthAgg?._sum?.amount || 0;
        const profitThisMonth = realRevenue - expensesThisMonth;
        const totalOrdersThisMonth = await this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } });
        const paidOrdersThisMonth = await this.prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: 'PAID' } });
        const conversionRate = totalOrdersThisMonth > 0
            ? ((paidOrdersThisMonth / totalOrdersThisMonth) * 100).toFixed(1)
            : '0';
        return {
            totalCustomers,
            customerGrowth: parseFloat(customerGrowth),
            ordersToday,
            totalCashflow: cashflowThisMonth,
            realRevenue: realRevenue,
            totalExpenses: expensesThisMonth,
            netProfit: profitThisMonth,
            conversionRate: parseFloat(conversionRate),
        };
    }
    async getRevenueChart(year) {
        const targetYear = year || new Date().getFullYear();
        const months = await Promise.all(Array.from({ length: 12 }, async (_, i) => {
            const start = new Date(targetYear, i, 1);
            const end = new Date(targetYear, i + 1, 0, 23, 59, 59);
            const cashAgg = await this.prisma.order.aggregate({
                where: { createdAt: { gte: start, lte: end } },
                _sum: { paidAmount: true },
                _count: { id: true }
            });
            const expAgg = await this.prisma.systemExpense.aggregate({
                where: { date: { gte: start, lte: end }, status: 'CONFIRMED' },
                _sum: { amount: true }
            });
            return {
                month: i + 1,
                cashflow: cashAgg._sum.paidAmount || 0,
                revenue: cashAgg._sum.paidAmount || 0,
                orders: cashAgg._count.id || 0,
                expenses: expAgg?._sum?.amount || 0,
            };
        }));
        return { year: targetYear, months };
    }
    async getTopCourses(limit = 5) {
        const items = await this.prisma.orderItem.groupBy({
            by: ['courseId'],
            _count: { courseId: true },
            _sum: { price: true },
            orderBy: { _count: { courseId: 'desc' } },
            take: limit,
        });
        const courseIds = items.map(i => i.courseId);
        const courses = await this.prisma.course.findMany({ where: { id: { in: courseIds } } });
        return items.map(item => {
            const course = courses.find(c => c.id === item.courseId);
            return {
                courseId: item.courseId,
                name: course?.name || 'Không xác định',
                code: course?.code || '',
                count: item._count.courseId,
                revenue: item._sum.price || 0,
            };
        });
    }
    async getRecentOrders(limit = 5) {
        return this.prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { name: true, phone: true, code: true } },
                items: { include: { course: { select: { name: true, code: true } } } },
            }
        });
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map