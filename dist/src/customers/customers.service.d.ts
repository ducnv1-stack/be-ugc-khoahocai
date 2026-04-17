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
        name: string;
        phone: string;
        email: string | null;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
        id: string;
        code: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(query?: {
        search?: string;
        page?: number;
        limit?: number;
        type?: 'lead' | 'regular' | 'all';
        onlyDeleted?: boolean;
    }): Promise<{
        items: {
            isLead: boolean;
            assignedSale: {
                name: string;
            } | null;
            orders: ({
                items: ({
                    course: {
                        name: string;
                        id: string;
                        code: string;
                        createdAt: Date;
                        deletedAt: Date | null;
                        description: string | null;
                        status: string;
                        price: number;
                        duration: number;
                        totalSessions: number;
                    };
                } & {
                    id: string;
                    orderId: string;
                    courseId: string;
                    price: number;
                })[];
            } & {
                id: string;
                createdAt: Date;
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
            })[];
            schedules: ({
                schedule: {
                    course: {
                        name: string;
                        id: string;
                        code: string;
                        createdAt: Date;
                        deletedAt: Date | null;
                        description: string | null;
                        status: string;
                        price: number;
                        duration: number;
                        totalSessions: number;
                    };
                    instructor: {
                        name: string;
                    };
                } & {
                    notes: string | null;
                    id: string;
                    createdAt: Date;
                    isOnline: boolean;
                    courseId: string;
                    instructorId: string;
                    startTime: Date;
                    endTime: Date;
                    maxCapacity: number;
                    meetingUrl: string | null;
                    googleEventId: string | null;
                    recurringGroupId: string | null;
                };
            } & {
                id: string;
                customerId: string;
                scheduleId: string;
                isAttended: boolean;
            })[];
            name: string;
            phone: string;
            email: string | null;
            cccd: string | null;
            address: string | null;
            source: string | null;
            notes: string | null;
            tags: string[];
            assignedSaleId: string | null;
            id: string;
            code: string | null;
            createdAt: Date;
            deletedAt: Date | null;
        }[];
        total: number;
    }>;
    getStats(): Promise<{
        active: number;
        leads: number;
        trash: number;
    }>;
    findOne(id: string): Promise<{
        orders: ({
            items: ({
                course: {
                    name: string;
                    id: string;
                    code: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    description: string | null;
                    status: string;
                    price: number;
                    duration: number;
                    totalSessions: number;
                };
            } & {
                id: string;
                orderId: string;
                courseId: string;
                price: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
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
        })[];
    } & {
        name: string;
        phone: string;
        email: string | null;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
        id: string;
        code: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, currentUser: any): Promise<{
        name: string;
        phone: string;
        email: string | null;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
        id: string;
        code: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    softDelete(id: string, currentUser: any): Promise<{
        name: string;
        phone: string;
        email: string | null;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
        id: string;
        code: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    restore(id: string, currentUser: any): Promise<{
        name: string;
        phone: string;
        email: string | null;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
        id: string;
        code: string | null;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    hardDelete(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    deleteLeadCustomer(id: string): Promise<{
        message: string;
    }>;
}
