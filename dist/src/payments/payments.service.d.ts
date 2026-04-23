import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
export declare class PaymentsService {
    private prisma;
    private configService;
    private socketGateway;
    private notificationsService;
    private auditService;
    private readonly logger;
    private static readonly LP_NOTE_PREFIX;
    constructor(prisma: PrismaService, configService: ConfigService, socketGateway: SocketGateway, notificationsService: NotificationsService, auditService: AuditService);
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
    getWebhookLogs(query?: {
        page?: number;
        limit?: number;
        status?: string;
        transferType?: string;
        search?: string;
    }): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAllPayments(): Promise<({
        order: {
            customer: {
                id: string;
                email: string | null;
                name: string | null;
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
        rawData: Prisma.JsonValue | null;
    })[]>;
    getWebhookSettings(): Promise<{
        url: string;
        secret: any;
        bankInfo: {
            id: any;
            accountNo: any;
            accountName: any;
        };
    }>;
    private handleLandingPageWebhook;
    private parseLandingPageMemo;
    private getAutomationUser;
    private generateNextCustomerCode;
    private removeAccents;
}
