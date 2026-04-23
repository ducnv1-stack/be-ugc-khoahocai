import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

const DEFAULT_CATEGORY_BY_TYPE: Record<string, string> = {
  ADVERTISING: 'MARKETING',
  OPERATIONS: 'OPERATIONS',
  EQUIPMENT: 'FACILITIES',
};

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
  createdBy?: { id: string; name: string } | null;
  approvedBy?: { id: string; name: string } | null;
};

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, userId?: string) {
    return (this.prisma.systemExpense as any).create({
      data: {
        name: createExpenseDto.name,
        amount: createExpenseDto.amount,
        type: createExpenseDto.type,
        category:
          createExpenseDto.category ||
          DEFAULT_CATEGORY_BY_TYPE[createExpenseDto.type] ||
          'OTHER',
        subCategory: createExpenseDto.subCategory || createExpenseDto.type,
        costCenter: createExpenseDto.costCenter || 'OPERATIONS',
        paymentMethod: createExpenseDto.paymentMethod || 'BANK_TRANSFER',
        nature: createExpenseDto.nature || 'VARIABLE',
        vendorName: createExpenseDto.vendorName,
        referenceType: createExpenseDto.referenceType,
        referenceId: createExpenseDto.referenceId,
        notes: createExpenseDto.notes,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    costCenter?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { type: { contains: query.search, mode: 'insensitive' } },
        { subCategory: { contains: query.search, mode: 'insensitive' } },
        { vendorName: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.category) where.category = query.category;
    if (query.costCenter) where.costCenter = query.costCenter;
    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = query.startDate;
      if (query.endDate) where.date.lte = query.endDate;
    }

    const [items, total] = await Promise.all([
      (this.prisma.systemExpense as any).findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      (this.prisma.systemExpense as any).count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string) {
    const expense = await (this.prisma.systemExpense as any).findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    if (!expense) {
      throw new NotFoundException('Không tìm thấy khoản chi');
    }

    return expense as ExpenseQueryResult;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id);
    return (this.prisma.systemExpense as any).update({
      where: { id },
      data: {
        ...updateExpenseDto,
        category:
          updateExpenseDto.category ||
          (updateExpenseDto.type
            ? DEFAULT_CATEGORY_BY_TYPE[updateExpenseDto.type] || undefined
            : undefined),
        subCategory: updateExpenseDto.subCategory || updateExpenseDto.type || undefined,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async confirm(id: string, approvedById?: string) {
    const expense = await this.findOne(id);
    if (expense.status === 'CANCELLED') {
      throw new BadRequestException('Không thể xác nhận khoản chi đã hủy');
    }

    return (this.prisma.systemExpense as any).update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        cancelledAt: null,
        approvedById: approvedById || expense.approvedById,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async cancel(id: string) {
    await this.findOne(id);
    return (this.prisma.systemExpense as any).update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma.systemExpense as any).delete({
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
    where.status = 'CONFIRMED';

    const expenses = await (this.prisma.systemExpense as any).findMany({ where }) as ExpenseQueryResult[];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = expenses.reduce((acc, e) => {
      const category = e.category || 'OTHER';
      acc[category] = (acc[category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const byCostCenter = expenses.reduce((acc, e) => {
      const costCenter = e.costCenter || 'GENERAL';
      acc[costCenter] = (acc[costCenter] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byCategory,
      byCostCenter,
      count: expenses.length,
    };
  }
}
