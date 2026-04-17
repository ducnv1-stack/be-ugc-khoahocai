import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, req: any): Promise<{
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
    getStats(): Promise<{
        active: number;
        leads: number;
        trash: number;
    }>;
    findAll(search?: string, page?: string, limit?: string, type?: 'lead' | 'regular' | 'all'): Promise<{
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
    findAllTrash(search?: string, page?: string, limit?: string): Promise<{
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
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
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
    deleteLead(id: string): Promise<{
        message: string;
    }>;
    hardDelete(id: string, req: any): Promise<{
        message: string;
    }>;
    restore(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
