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
        phone: string;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
        deletedAt: Date | null;
    }>;
    findAll(search?: string, skip?: string, take?: string): Promise<{
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
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: any): Promise<{
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
    deleteLead(id: string): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
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
}
