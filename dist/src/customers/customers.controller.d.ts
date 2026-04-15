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
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
        assignedSaleId: string | null;
    }>;
    findAll(search?: string, skip?: string, take?: string): Promise<{
        isLead: boolean;
        assignedSale: {
            name: string;
        } | null;
        orders: ({
            items: ({
                course: {
                    id: string;
                    code: string;
                    name: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    status: string;
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
                    id: string;
                    code: string;
                    name: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    status: string;
                    price: number;
                    duration: number;
                    totalSessions: number;
                    description: string | null;
                };
                instructor: {
                    name: string;
                };
            } & {
                id: string;
                notes: string | null;
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
        id: string;
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
        assignedSaleId: string | null;
    }[]>;
    findAllTrash(search?: string, skip?: string, take?: string): Promise<{
        isLead: boolean;
        assignedSale: {
            name: string;
        } | null;
        orders: ({
            items: ({
                course: {
                    id: string;
                    code: string;
                    name: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    status: string;
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
                    id: string;
                    code: string;
                    name: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    status: string;
                    price: number;
                    duration: number;
                    totalSessions: number;
                    description: string | null;
                };
                instructor: {
                    name: string;
                };
            } & {
                id: string;
                notes: string | null;
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
        id: string;
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
        assignedSaleId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        orders: ({
            items: ({
                course: {
                    id: string;
                    code: string;
                    name: string;
                    createdAt: Date;
                    deletedAt: Date | null;
                    status: string;
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
        id: string;
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
        assignedSaleId: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
        id: string;
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
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
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
        assignedSaleId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        code: string | null;
        name: string;
        phone: string;
        email: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        createdAt: Date;
        deletedAt: Date | null;
        assignedSaleId: string | null;
    }>;
}
