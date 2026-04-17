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
        createdAt: Date;
        status: string;
        source: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        retryCount: number;
    }[]>;
    findAllPayments(): Promise<({
        order: {
            customer: {
                id: string;
                email: string | null;
                name: string;
                createdAt: Date;
                code: string | null;
                deletedAt: Date | null;
                phone: string;
                cccd: string | null;
                address: string | null;
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
                    totalSessions: number;
                    status: string;
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
