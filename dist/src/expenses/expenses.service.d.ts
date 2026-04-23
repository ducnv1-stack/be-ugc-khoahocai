import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
type ExpenseQueryResult = {
    id: string;
    name: string;
    amount: number;
    type: string;
    category?: string;
    subCategory?: string | null;
    costCenter?: string;
    paymentMethod?: string;
    status?: string;
    nature?: string;
    vendorName?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
    notes?: string | null;
    date: Date;
    createdById?: string | null;
    approvedById?: string | null;
    createdBy?: {
        id: string;
        name: string;
    } | null;
    approvedBy?: {
        id: string;
        name: string;
    } | null;
};
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto, userId?: string): Promise<any>;
    findAll(query: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        costCenter?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<ExpenseQueryResult>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<any>;
    confirm(id: string, approvedById?: string): Promise<any>;
    cancel(id: string): Promise<any>;
    remove(id: string): Promise<any>;
    getStats(startDate?: Date, endDate?: Date): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byCostCenter: Record<string, number>;
        count: number;
    }>;
}
export {};
