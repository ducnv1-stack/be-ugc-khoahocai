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

    // Total customers (not deleted)
    const totalCustomers = await this.prisma.customer.count({ where: { deletedAt: null } });
    const lastMonthCustomers = await this.prisma.customer.count({
      where: { deletedAt: null, createdAt: { lt: startOfMonth } }
    });
    const customerGrowth = lastMonthCustomers > 0
      ? ((totalCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
      : '0';

    // New orders today
    const ordersToday = await this.prisma.order.count({
      where: { createdAt: { gte: startOfToday } }
    });
    const ordersYesterday = await this.prisma.order.count({
      where: { createdAt: { gte: new Date(startOfToday.getTime() - 86400000), lt: startOfToday } }
    });
    const orderGrowth = ordersYesterday > 0
      ? ((ordersToday - ordersYesterday) / ordersYesterday * 100).toFixed(1)
      : '0';

    // Revenue this month (paidAmount sum)
    const revenueThisMonthAgg = await this.prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { paidAmount: true }
    });
    const revenueLastMonthAgg = await this.prisma.order.aggregate({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { paidAmount: true }
    });
    const revenueThisMonth = revenueThisMonthAgg._sum.paidAmount || 0;
    const revenueLastMonth = revenueLastMonthAgg._sum.paidAmount || 0;
    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : '0';

    // Conversion rate: PAID orders / total orders this month
    const totalOrdersThisMonth = await this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } });
    const paidOrdersThisMonth = await this.prisma.order.count({ where: { createdAt: { gte: startOfMonth }, status: 'PAID' } });
    const conversionRate = totalOrdersThisMonth > 0
      ? ((paidOrdersThisMonth / totalOrdersThisMonth) * 100).toFixed(1)
      : '0';

    return {
      totalCustomers,
      customerGrowth: parseFloat(customerGrowth),
      ordersToday,
      orderGrowth: parseFloat(orderGrowth),
      revenueThisMonth,
      revenueGrowth: parseFloat(revenueGrowth),
      conversionRate: parseFloat(conversionRate),
    };
  }

  async getRevenueChart(year?: number) {
    const targetYear = year || new Date().getFullYear();

    // Monthly revenue for the year
    const months = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const start = new Date(targetYear, i, 1);
        const end = new Date(targetYear, i + 1, 0, 23, 59, 59);
        const agg = await this.prisma.order.aggregate({
          where: { createdAt: { gte: start, lte: end } },
          _sum: { paidAmount: true },
          _count: { id: true },
        });
        return {
          month: i + 1,
          revenue: agg._sum.paidAmount || 0,
          orders: agg._count.id,
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
