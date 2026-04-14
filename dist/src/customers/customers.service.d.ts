import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';
import { SocketGateway } from '../socket/socket.gateway';
export declare class CustomersService {
    private prisma;
    private auditService;
    private socketGateway;
    constructor(prisma: PrismaService, auditService: AuditService, socketGateway: SocketGateway);
    generateNextCode(): Promise<string>;
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
        assignedSale: {
            name: string;
        } | null;
    } & {
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
    }>;
    findAll(query?: {
        search?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        isLead: boolean;
        orders: ({
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
        })[];
        assignedSale: {
            name: string;
        } | null;
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
    }[]>;
    findOne(id: string): Promise<{
        orders: ({
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
        })[];
    } & {
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
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, currentUser: any): Promise<{
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
    }>;
    softDelete(id: string): Promise<{
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
    }>;
    deleteLeadCustomer(id: string): Promise<{
        message: string;
    }>;
}
