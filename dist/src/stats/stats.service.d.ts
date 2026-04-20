import { PrismaService } from '../prisma/prisma.service';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalCustomers: number;
        customerGrowth: number;
        ordersToday: number;
        totalCashflow: number;
        realRevenue: any;
        totalExpenses: number;
        netProfit: number;
        conversionRate: number;
    }>;
    getRevenueChart(year?: number): Promise<{
        year: number;
        months: {
            month: number;
            cashflow: number;
            revenue: number;
            orders: number;
            expenses: number;
        }[];
    }>;
    getTopCourses(limit?: number): Promise<{
        courseId: string;
        name: string;
        code: string;
        count: number;
        revenue: number;
    }[]>;
    getRecentOrders(limit?: number): Promise<({
        customer: {
            name: string | null;
            code: string | null;
            phone: string;
        };
        items: ({
            course: {
                name: string;
                code: string;
            };
        } & {
            id: string;
            price: number;
            orderId: string;
            courseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        customerId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
    })[]>;
}
