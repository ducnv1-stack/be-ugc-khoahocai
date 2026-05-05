import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(): Promise<({
        order: {
            customer: {
                id: string;
                createdAt: Date;
                name: string | null;
                code: string | null;
                phone: string;
                email: string | null;
                cccd: string | null;
                address: string | null;
                source: string | null;
                notes: string | null;
                tags: string[];
                assignedSaleId: string | null;
                deletedAt: Date | null;
            };
            items: ({
                course: {
                    id: string;
                    status: string;
                    createdAt: Date;
                    name: string;
                    code: string;
                    deletedAt: Date | null;
                    price: number;
                    duration: number;
                    totalSessions: number;
                    description: string | null;
                };
            } & {
                id: string;
                orderId: string;
                courseId: string;
                price: number;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
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
            isLead: boolean;
        };
    } & {
        id: string;
        orderId: string;
        amount: number;
        status: import(".prisma/client").$Enums.PaymentStatus;
        transactionCode: string | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    })[]>;
    handleSePayWebhook(payload: any, authHeader: string): Promise<{
        status: string;
        mode: string;
        orderId: string;
        message?: undefined;
    } | {
        status: string;
        message: string;
        orderId?: undefined;
    } | {
        status: string;
        message: string;
        orderId: string;
    } | {
        status: string;
        message?: undefined;
        orderId?: undefined;
    }>;
    verifyWebhook(): {
        status: string;
        message: string;
    };
    getSettings(): Promise<{
        url: string;
        secret: any;
        bankInfo: {
            id: any;
            accountNo: any;
            accountName: any;
        };
    }>;
    getWebhookLogs(page?: string, limit?: string, status?: string, transferType?: string, search?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
