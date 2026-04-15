import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { addDays, setHours, setMinutes, setSeconds, isSameDay } from 'date-fns';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { courseId?: string }) {
    const where: any = {};
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }

    return this.prisma.schedule.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true, totalSessions: true } },
        instructor: { select: { id: true, name: true } },
        _count: { select: { students: true } },
        students: {
          include: {
            customer: { select: { id: true, name: true, phone: true, code: true } }
          }
        }
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, name: true, code: true } },
        instructor: { select: { id: true, name: true } },
        students: {
          include: {
            customer: { select: { id: true, name: true, phone: true, code: true } }
          }
        }
      }
    });
  }

  async create(data: {
    courseId: string;
    instructorId: string;
    startTime: Date;
    endTime: Date;
    maxCapacity?: number;
    meetingUrl?: string;
    notes?: string;
    isOnline?: boolean;
    recurring?: {
      daysOfWeek: number[];
      totalSessions: number;
    }
  }) {
    if (!data.recurring) {
      return this.prisma.schedule.create({
        data: {
          courseId: data.courseId,
          instructorId: data.instructorId,
          startTime: data.startTime,
          endTime: data.endTime,
          maxCapacity: data.maxCapacity || 10,
          meetingUrl: data.meetingUrl,
          notes: data.notes,
          isOnline: data.isOnline ?? true,
        }
      });
    }

    const recurringGroupId = uuidv4();
    const schedules = this._generateRecurringSchedules(data, recurringGroupId);

    return this.prisma.$transaction(
      schedules.map(s => this.prisma.schedule.create({ data: s }))
    );
  }

  private _generateRecurringSchedules(data: any, recurringGroupId: string) {
    const schedules: any[] = [];
    let currentCount = 0;
    let currentDate = new Date(data.startTime);
    const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime();

    while (currentCount < data.recurring.totalSessions) {
      const dayOfWeek = currentDate.getDay();
      if (data.recurring.daysOfWeek.includes(dayOfWeek)) {
        const sessionStartTime = new Date(currentDate);
        const sessionEndTime = new Date(sessionStartTime.getTime() + duration);

        schedules.push({
          courseId: data.courseId,
          instructorId: data.instructorId,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          maxCapacity: data.maxCapacity || 10,
          meetingUrl: data.meetingUrl,
          notes: data.notes,
          isOnline: data.isOnline ?? true,
          recurringGroupId,
        });
        currentCount++;
      }
      currentDate = addDays(currentDate, 1);
      if (schedules.length > 100) break;
    }
    return schedules;
  }

  async updateTime(id: string, startTime: Date, endTime: Date) {
    return this.prisma.schedule.update({
      where: { id },
      data: { startTime, endTime }
    });
  }

  async update(id: string, data: { 
    courseId?: string; 
    instructorId?: string; 
    maxCapacity?: number; 
    meetingUrl?: string; 
    startTime?: Date; 
    endTime?: Date;
    notes?: string;
    isOnline?: boolean;
    recurring?: {
      daysOfWeek: number[];
      totalSessions: number;
    }
  }) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Lịch học không tồn tại');

    // Update the current record
    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        courseId: data.courseId,
        instructorId: data.instructorId,
        maxCapacity: data.maxCapacity,
        meetingUrl: data.meetingUrl,
        notes: data.notes,
        isOnline: data.isOnline,
        startTime: data.startTime,
        endTime: data.endTime,
      }
    });

    // If recurring options are provided, generate the rest of the series
    if (data.recurring && data.recurring.totalSessions > 1) {
      const recurringGroupId = schedule.recurringGroupId || uuidv4();
      
      // If we are starting from an existing session, we need to update its groupId
      if (!schedule.recurringGroupId) {
        await this.prisma.schedule.update({
          where: { id },
          data: { recurringGroupId }
        });
      }

      // Generate the REMAINING sessions (totalSessions - 1)
      const recurringData = {
        ...data,
        recurring: {
          ...data.recurring,
          totalSessions: data.recurring.totalSessions - 1
        },
        // Start from the day after the current session
        startTime: addDays(new Date(data.startTime || schedule.startTime), 1),
        endTime: addDays(new Date(data.endTime || schedule.endTime), 1),
      };

      const remainingSchedules = this._generateRecurringSchedules(recurringData, recurringGroupId);
      
      if (remainingSchedules.length > 0) {
        await this.prisma.$transaction(
          remainingSchedules.map(s => this.prisma.schedule.create({ data: s }))
        );
      }
    }

    return updated;
  }

  async toggleAttendance(scheduleId: string, customerId: string) {
    const record = await this.prisma.scheduleStudent.findUnique({
      where: { scheduleId_customerId: { scheduleId, customerId } }
    });

    if (!record) throw new NotFoundException('Học viên không có trong lớp này');

    return this.prisma.scheduleStudent.update({
      where: { scheduleId_customerId: { scheduleId, customerId } },
      data: { isAttended: !record.isAttended }
    });
  }

  async removeSchedule(id: string, deleteAllInSeries: boolean) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id }
    });

    if (!schedule) throw new NotFoundException('Lịch học không tồn tại');

    if (deleteAllInSeries && schedule.recurringGroupId) {
      return this.prisma.schedule.deleteMany({
        where: { recurringGroupId: schedule.recurringGroupId }
      });
    }

    return this.prisma.schedule.delete({
      where: { id }
    });
  }

  async addStudent(scheduleId: string, customerId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { _count: { select: { students: true } } },
    });
    if (!schedule) throw new NotFoundException('Lịch học không tồn tại');

    if (schedule._count.students >= schedule.maxCapacity) {
      throw new BadRequestException('Lớp học đã đủ sĩ số tối đa');
    }

    const existing = await this.prisma.scheduleStudent.findUnique({
      where: { scheduleId_customerId: { scheduleId, customerId } }
    });

    if (existing) throw new BadRequestException('Học viên đã có trong lớp này');

    return this.prisma.scheduleStudent.create({
      data: {
        scheduleId,
        customerId,
        isAttended: false,
      }
    });
  }

  async searchCustomers(query: string, scheduleId?: string) {
    const searchTerm = query.trim();
    console.log(`[SearchStudents] query="${searchTerm}", scheduleId="${scheduleId}"`);
    
    // Determine the base where clause
    const where: any = { deletedAt: null };
    
    if (searchTerm.length < 2) {
      return [];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      include: {
        schedules: {
          where: { scheduleId },
          select: { id: true }
        },
        orders: {
          where: {
            status: { not: 'CANCELLED' },
          },
          include: {
            items: true
          }
        }
      },
      take: 20,
    });

    console.log(`[SearchStudents] Found ${customers.length} results`);
    
    if (!scheduleId) return customers;

    const currentSchedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { courseId: true }
    });

    return customers.map(customer => {
      // Check if already assigned
      const isAssigned = customer.schedules.length > 0;

      // Check tuition for the course
      let tuitionStatus: 'PAID' | 'UNPAID' | 'NOT_ENROLLED' = 'NOT_ENROLLED';
      const relevantOrder = customer.orders.find(order => 
        order.items.some(item => item.courseId === currentSchedule?.courseId)
      );

      if (relevantOrder) {
        tuitionStatus = (relevantOrder.paidAmount >= relevantOrder.finalPrice) ? 'PAID' : 'UNPAID';
      }

      const { schedules, orders, ...customerData } = customer;
      return {
        ...customerData,
        isAssigned,
        tuitionStatus,
        unpaidAmount: relevantOrder ? Math.max(0, relevantOrder.finalPrice - relevantOrder.paidAmount) : 0
      };
    });
  }

  async getPotentialStudents(scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { courseId: true }
    });

    if (!schedule) return [];

    const customers = await this.prisma.customer.findMany({
      where: {
        deletedAt: null,
        orders: {
          some: {
            status: { not: 'CANCELLED' },
            items: { some: { courseId: schedule.courseId } }
          }
        }
      },
      include: {
        schedules: {
          where: { scheduleId },
          select: { id: true }
        },
        orders: {
          where: {
            status: { not: 'CANCELLED' },
          },
          include: {
            items: true
          }
        }
      }
    });

    return customers.map(customer => {
      // Check if already assigned
      const isAssigned = customer.schedules.length > 0;

      // Check tuition for the course
      let tuitionStatus: 'PAID' | 'UNPAID' | 'NOT_ENROLLED' = 'NOT_ENROLLED';
      const relevantOrder = customer.orders.find(order => 
        order.items.some(item => item.courseId === schedule.courseId)
      );

      if (relevantOrder) {
        tuitionStatus = (relevantOrder.paidAmount >= relevantOrder.finalPrice) ? 'PAID' : 'UNPAID';
      }

      return {
        ...customer,
        isAssigned,
        tuitionStatus,
        debtAmount: relevantOrder ? Math.max(0, relevantOrder.finalPrice - relevantOrder.paidAmount) : 0
      };
    });
  }

  async removeStudent(scheduleId: string, customerId: string) {
    return this.prisma.scheduleStudent.delete({
      where: { scheduleId_customerId: { scheduleId, customerId } }
    });
  }

  async bulkAddStudents(scheduleIds: string[], customerId: string) {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[],
    };

    for (const scheduleId of scheduleIds) {
      try {
        await this.addStudent(scheduleId, customerId);
        results.success.push(scheduleId);
      } catch (err: any) {
        results.failed.push({
          id: scheduleId,
          reason: err.message || 'Lỗi không xác định',
        });
      }
    }

    return results;
  }
}
