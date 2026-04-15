import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(): Promise<({
        order: {
            customer: {
                id: string;
                source: string | null;
                createdAt: Date;
                name: string;
                code: string | null;
                phone: string;
                email: string | null;
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
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        orderId: string;
        amount: number;
        transactionCode: string | null;
        rawData: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    handleSePayWebhook(payload: any, authHeader: string): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
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
    getWebhookLogs(): Promise<{
        id: string;
        source: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        retryCount: number;
        createdAt: Date;
    }[]>;
}
