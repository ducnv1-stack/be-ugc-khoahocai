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
            name: string | null;
            phone: string;
        };
        sale: {
            name: string;
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
    })[]>;
    findOne(id: string): Promise<{
        payments: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            transactionCode: string | null;
            rawData: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
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
        sale: {
            name: string;
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
    }>;
    updateMemo(id: string, newMemo: string): Promise<{
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
    }>;
    updatePrice(id: string, data: {
        discountType?: DiscountType;
        discountValue?: number;
        finalPrice: number;
    }, userId: string): Promise<{
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
    }>;
    updatePaidAmount(id: string, paidAmount: number, userId: string): Promise<{
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
    }>;
    updateInvoiceStatus(id: string, invoiceIssued: boolean, userId: string): Promise<{
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
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
    private removeAccents;
    private generateQrUrl;
}
