import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDashboardStats(): Promise<{
        totalCustomers: number;
        customerGrowth: number;
        ordersToday: number;
        orderGrowth: number;
        revenueThisMonth: number;
        revenueGrowth: number;
        conversionRate: number;
    }>;
    getRevenueChart(year?: string): Promise<{
        year: number;
        months: {
            month: number;
            revenue: number;
            orders: number;
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
            name: string;
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
        status: import(".prisma/client").$Enums.OrderStatus;
        customerId: string;
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
    })[]>;
}
