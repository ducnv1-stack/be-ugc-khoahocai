import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { DiscountType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CustomersService } from '../customers/customers.service';
import { SocketGateway } from '../socket/socket.gateway';
export declare class OrdersService {
    private prisma;
    private configService;
    private auditService;
    private customersService;
    private socketGateway;
    constructor(prisma: PrismaService, configService: ConfigService, auditService: AuditService, customersService: CustomersService, socketGateway: SocketGateway);
    create(createOrderDto: CreateOrderDto, saleId: string): Promise<any>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        customer: {
            name: string;
            phone: string;
        };
        sale: {
            name: string;
        };
        items: ({
            course: {
                id: string;
                status: string;
                createdAt: Date;
                code: string;
                name: string;
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
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            code: string | null;
            name: string;
            phone: string;
            email: string | null;
            source: string | null;
            notes: string | null;
            tags: string[];
            assignedSaleId: string | null;
            deletedAt: Date | null;
        };
        sale: {
            name: string;
        };
        items: ({
            course: {
                id: string;
                status: string;
                createdAt: Date;
                code: string;
                name: string;
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
        payments: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            orderId: string;
            amount: number;
            transactionCode: string | null;
            rawData: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    }>;
    updateMemo(id: string, newMemo: string): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    }>;
    updatePrice(id: string, data: {
        discountType?: DiscountType;
        discountValue?: number;
        finalPrice: number;
    }, userId: string): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    }>;
    updatePaidAmount(id: string, paidAmount: number, userId: string): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    }>;
    updateInvoiceStatus(id: string, invoiceIssued: boolean, userId: string): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        customerId: string;
        saleId: string;
        totalPrice: number;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        finalPrice: number;
        paidAmount: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        isLead: boolean;
        createdAt: Date;
    }>;
    private removeAccents;
    private generateQrUrl;
}
