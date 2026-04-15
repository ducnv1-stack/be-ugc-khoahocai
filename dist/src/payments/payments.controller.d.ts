import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(): Promise<({
        order: {
            customer: {
                id: string;
                email: string | null;
                name: string;
                createdAt: Date;
                code: string | null;
                deletedAt: Date | null;
                phone: string;
                source: string | null;
                notes: string | null;
                tags: string[];
                assignedSaleId: string | null;
            };
            items: ({
                course: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    code: string;
                    description: string | null;
                    price: number;
                    duration: number;
                    status: string;
                    totalSessions: number;
                    deletedAt: Date | null;
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
        };
    } & {
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
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
        createdAt: Date;
        status: string;
        source: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        retryCount: number;
    }[]>;
}
