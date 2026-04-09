import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { DiscountType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
export declare class OrdersService {
    private prisma;
    private configService;
    private auditService;
    constructor(prisma: PrismaService, configService: ConfigService, auditService: AuditService);
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
                name: string;
                createdAt: Date;
                code: string;
                description: string | null;
                price: number;
                duration: number;
                status: string;
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
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    })[]>;
    findOne(id: string): Promise<{
        payments: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            orderId: string;
            transactionCode: string | null;
            rawData: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        customer: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            code: string | null;
            phone: string;
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
                name: string;
                createdAt: Date;
                code: string;
                description: string | null;
                price: number;
                duration: number;
                status: string;
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
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    }>;
    updateMemo(id: string, newMemo: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customerId: string;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    }>;
    updatePrice(id: string, data: {
        discountType?: DiscountType;
        discountValue?: number;
        finalPrice: number;
    }, userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customerId: string;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    }>;
    updatePaidAmount(id: string, paidAmount: number, userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customerId: string;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    }>;
    updateInvoiceStatus(id: string, invoiceIssued: boolean, userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customerId: string;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        customerId: string;
        discountType: import(".prisma/client").$Enums.DiscountType | null;
        discountValue: number | null;
        totalPrice: number;
        finalPrice: number;
        paidAmount: number;
        qrCode: string | null;
        memo: string | null;
        memoEditable: boolean;
        locked: boolean;
        invoiceIssued: boolean;
        saleId: string;
    }>;
    private removeAccents;
    private generateQrUrl;
}
