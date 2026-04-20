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
            })[];
            schedules: ({
                schedule: {
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
                    instructor: {
                        name: string;
                    };
                } & {
                    id: string;
                    isOnline: boolean;
                    createdAt: Date;
                    notes: string | null;
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
                scheduleId: string;
                customerId: string;
                isAttended: boolean;
            })[];
            assignedSale: {
                name: string;
            } | null;
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
        })[];
    } & {
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
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, currentUser: any): Promise<{
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
    }>;
    softDelete(id: string, currentUser: any): Promise<{
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
    }>;
    restore(id: string, currentUser: any): Promise<{
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
    }>;
    hardDelete(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    deleteLeadCustomer(id: string): Promise<{
        message: string;
    }>;
}
