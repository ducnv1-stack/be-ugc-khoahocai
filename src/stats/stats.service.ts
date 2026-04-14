import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Khách hàng
    const totalCustomers = await this.prisma.customer.count({ where: { deletedAt: null } });
    const lastMonthCustomers = await this.prisma.customer.count({
      where: { deletedAt: null, createdAt: { lt: startOfMonth } }
    });
    const customerGrowth = lastMonthCustomers > 0
      ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
      : '0';

    // 2. Đơn hàng (Orders today)
    const ordersToday = await this.prisma.order.count({
      where: { createdAt: { gte: startOfToday } }
    });

    // 3. Tiền thực thu (Cashflow) - Tính dựa trên số tiền khách đã đóng
    const cashflowThisMonthAgg = await this.prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { paidAmount: true }
    });
    const cashflowThisMonth = cashflowThisMonthAgg._sum.paidAmount || 0;

    // 4. Doanh thu thực tế (Revenue) - Tính dựa trên số buổi học viên đã điểm danh
    // Công thức: Doanh thu = Sum( (Số buổi đã học / Tổng buổi khóa) * Giá sau giảm giá )
    // Để đơn giản và chính xác, ta lấy giá trị từng buổi * số buổi đã học
    const revenueStats = await this.prisma.$queryRaw`
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
    const realRevenue = (revenueStats as any)[0]?.realRevenue || 0;

    // 5. Chi phí (Expenses)
    const expensesThisMonthAgg = await this.prisma.systemExpense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true }
    });
    const expensesThisMonth = expensesThisMonthAgg._sum.amount || 0;

    // 6. Lợi nhuận (Profit) = Doanh thu thực tế - Chi phí
    const profitThisMonth = realRevenue - expensesThisMonth;

    // Conversion rate
    const totalOrdersThisMonth = await this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } });
    const paidOrdersThisMonth = await this.prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: 'PAID' } });
    const conversionRate = totalOrdersThisMonth > 0
      ? ((paidOrdersThisMonth / totalOrdersThisMonth) * 100).toFixed(1)
      : '0';

    return {
      totalCustomers,
      customerGrowth: parseFloat(customerGrowth),
      ordersToday,
      totalCashflow: cashflowThisMonth, // Tiền thu trước
      realRevenue: realRevenue,       // Doanh thu thực tế (đã dạy)
      totalExpenses: expensesThisMonth,
      netProfit: profitThisMonth,
      conversionRate: parseFloat(conversionRate),
    };
  }

  async getRevenueChart(year?: number) {
    const targetYear = year || new Date().getFullYear();

    const months = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const start = new Date(targetYear, i, 1);
        const end = new Date(targetYear, i + 1, 0, 23, 59, 59);
        
        const cashAgg = await this.prisma.order.aggregate({
          where: { createdAt: { gte: start, lte: end } },
          _sum: { paidAmount: true },
          _count: { id: true }
        });

        const expAgg = await this.prisma.systemExpense.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { amount: true }
        });

        return {
          month: i + 1,
          cashflow: cashAgg._sum.paidAmount || 0,
          revenue: cashAgg._sum.paidAmount || 0,
          orders: cashAgg._count.id || 0,
          expenses: expAgg._sum.amount || 0,
        };
      })
    );

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
}
