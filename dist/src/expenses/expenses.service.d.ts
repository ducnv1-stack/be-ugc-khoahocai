import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: string;
        amount: number;
        date: Date;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: string;
        amount: number;
        date: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: string;
        amount: number;
        date: Date;
    } | null>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: string;
        amount: number;
        date: Date;
    }>;
    getStats(startDate?: Date, endDate?: Date): Promise<{
        total: number;
        byType: Record<string, number>;
        count: number;
    }>;
}
