import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboardStats(): Promise<{
        totalCustomers: number;
        customerGrowth: number;
        ordersToday: number;
        totalCashflow: number;
        realRevenue: any;
        totalExpenses: any;
        netProfit: number;
        conversionRate: number;
    }>;
    getRevenueChart(year?: string): Promise<{
        year: number;
        months: {
            month: number;
            cashflow: number;
            revenue: number;
            orders: number;
            expenses: any;
        }[];
    }>;
    getTopCourses(limit?: string): Promise<{
        courseId: string;
        name: string;
        code: string;
        count: number;
        revenue: number;
    }[]>;
    getRecentOrders(limit?: string): Promise<({
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
