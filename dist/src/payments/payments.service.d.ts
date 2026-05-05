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
                createdAt: Date;
                name: string | null;
                source: string | null;
                code: string | null;
                phone: string;
                email: string | null;
                cccd: string | null;
                address: string | null;
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
                    description: string | null;
                    price: number;
                    duration: number;
                    totalSessions: number;
                };
            } & {
                id: string;
                orderId: string;
                price: number;
                courseId: string;
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
        transactionCode: string | null;
        orderId: string;
        amount: number;
        status: import(".prisma/client").$Enums.PaymentStatus;
        rawData: Prisma.JsonValue | null;
        createdAt: Date;
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
