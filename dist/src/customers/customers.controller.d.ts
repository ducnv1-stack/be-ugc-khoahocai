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
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }>;
    getStats(): Promise<{
        active: number;
        leads: number;
        trash: number;
    }>;
    findAll(search?: string, page?: string, limit?: string, type?: 'lead' | 'regular' | 'all'): Promise<{
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
            name: string;
            createdAt: Date;
            code: string | null;
            deletedAt: Date | null;
            phone: string;
            source: string | null;
            notes: string | null;
            tags: string[];
            assignedSaleId: string | null;
        }[];
        total: number;
    }>;
    findAllTrash(search?: string, page?: string, limit?: string): Promise<{
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
            name: string;
            createdAt: Date;
            code: string | null;
            deletedAt: Date | null;
            phone: string;
            source: string | null;
            notes: string | null;
            tags: string[];
            assignedSaleId: string | null;
        }[];
        total: number;
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
        name: string;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }>;
    deleteLead(id: string): Promise<{
        message: string;
    }>;
    hardDelete(id: string, req: any): Promise<{
        message: string;
    }>;
    restore(id: string, req: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }>;
}
