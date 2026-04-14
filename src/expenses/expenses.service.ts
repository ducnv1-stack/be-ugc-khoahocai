import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    return this.prisma.systemExpense.create({
      data: {
        ...createExpenseDto,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.systemExpense.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.systemExpense.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.systemExpense.delete({
      where: { id },
    });
  }

  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const expenses = await this.prisma.systemExpense.findMany({ where });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byType = expenses.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byType,
      count: expenses.length,
    };
  }
}
