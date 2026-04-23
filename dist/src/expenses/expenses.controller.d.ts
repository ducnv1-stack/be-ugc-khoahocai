import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto, req: any): Promise<any>;
    findAll(page?: string, limit?: string, search?: string, category?: string, costCenter?: string, status?: string, startDate?: string, endDate?: string): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(startDate?: string, endDate?: string): Promise<{
        total: number;
        byCategory: Record<string, number>;
        byCostCenter: Record<string, number>;
        count: number;
    }>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<any>;
    confirm(id: string, req: any): Promise<any>;
    cancel(id: string): Promise<any>;
    remove(id: string): Promise<any>;
}
