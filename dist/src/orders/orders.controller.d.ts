import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { DiscountType } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<any>;
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
                totalSessions: number;
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
                totalSessions: number;
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
    updateMemo(id: string, memo: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    updatePrice(id: string, data: {
        discountType?: DiscountType;
        discountValue?: number;
        finalPrice: number;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    updatePaidAmount(id: string, paidAmount: number, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    updateInvoiceStatus(id: string, invoiceIssued: boolean, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
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
    }>;
}
