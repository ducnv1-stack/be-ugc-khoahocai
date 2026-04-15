import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
export declare class PaymentsService {
    private prisma;
    private configService;
    private socketGateway;
    private notificationsService;
    private auditService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, socketGateway: SocketGateway, notificationsService: NotificationsService, auditService: AuditService);
    handleSePayWebhook(payload: any, authHeader: string): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
    getWebhookLogs(): Promise<{
        id: string;
        source: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        retryCount: number;
        createdAt: Date;
    }[]>;
    findAllPayments(): Promise<({
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
    private removeAccents;
    getWebhookSettings(): Promise<{
        url: string;
        secret: any;
        bankInfo: {
            id: any;
            accountNo: any;
            accountName: any;
        };
    }>;
}
