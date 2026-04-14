import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { addDays, setHours, setMinutes, setSeconds, isSameDay } from 'date-fns';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.schedule.findMany({
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
    recurring?: {
      daysOfWeek: number[]; // 0 for Sunday, 1 for Monday, etc.
      totalSessions: number;
    }
  }) {
    if (!data.recurring) {
      // Create single session
      return this.prisma.schedule.create({
        data: {
          courseId: data.courseId,
          instructorId: data.instructorId,
          startTime: data.startTime,
          endTime: data.endTime,
          maxCapacity: data.maxCapacity || 10,
          meetingUrl: data.meetingUrl,
        }
      });
    }

    // Create recurring series
    const recurringGroupId = uuidv4();
    const schedules: any[] = [];
    let currentCount = 0;
    let currentDate = new Date(data.startTime);
    
    // Duration in ms
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
          recurringGroupId,
        });
        currentCount++;
      }
      currentDate = addDays(currentDate, 1);
      
      // Safety break to prevent infinite loop
      if (schedules.length > 100) break;
    }

    return this.prisma.$transaction(
      schedules.map(s => this.prisma.schedule.create({ data: s }))
    );
  }

  async updateTime(id: string, startTime: Date, endTime: Date) {
    return this.prisma.schedule.update({
      where: { id },
      data: { startTime, endTime }
    });
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

  async searchCustomers(query: string) {
    return this.prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query.trim(), mode: 'insensitive' } },
          { phone: { contains: query.trim() } },
        ],
        deletedAt: null,
      },
      take: 10,
    });
  }
}
