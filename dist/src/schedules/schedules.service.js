"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
let SchedulesService = class SchedulesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
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
    async findOne(id) {
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
    async create(data) {
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
        const recurringGroupId = (0, uuid_1.v4)();
        const schedules = this._generateRecurringSchedules(data, recurringGroupId);
        return this.prisma.$transaction(schedules.map(s => this.prisma.schedule.create({ data: s })));
    }
    _generateRecurringSchedules(data, recurringGroupId) {
        const schedules = [];
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
            currentDate = (0, date_fns_1.addDays)(currentDate, 1);
            if (schedules.length > 100)
                break;
        }
        return schedules;
    }
    async updateTime(id, startTime, endTime) {
        return this.prisma.schedule.update({
            where: { id },
            data: { startTime, endTime }
        });
    }
    async update(id, data) {
        const schedule = await this.prisma.schedule.findUnique({ where: { id } });
        if (!schedule)
            throw new common_1.NotFoundException('Lịch học không tồn tại');
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
        if (data.recurring && data.recurring.totalSessions > 1) {
            const recurringGroupId = schedule.recurringGroupId || (0, uuid_1.v4)();
            if (!schedule.recurringGroupId) {
                await this.prisma.schedule.update({
                    where: { id },
                    data: { recurringGroupId }
                });
            }
            const recurringData = {
                ...data,
                recurring: {
                    ...data.recurring,
                    totalSessions: data.recurring.totalSessions - 1
                },
                startTime: (0, date_fns_1.addDays)(new Date(data.startTime || schedule.startTime), 1),
                endTime: (0, date_fns_1.addDays)(new Date(data.endTime || schedule.endTime), 1),
            };
            const remainingSchedules = this._generateRecurringSchedules(recurringData, recurringGroupId);
            if (remainingSchedules.length > 0) {
                await this.prisma.$transaction(remainingSchedules.map(s => this.prisma.schedule.create({ data: s })));
            }
        }
        return updated;
    }
    async toggleAttendance(scheduleId, customerId) {
        const record = await this.prisma.scheduleStudent.findUnique({
            where: { scheduleId_customerId: { scheduleId, customerId } }
        });
        if (!record)
            throw new common_1.NotFoundException('Học viên không có trong lớp này');
        return this.prisma.scheduleStudent.update({
            where: { scheduleId_customerId: { scheduleId, customerId } },
            data: { isAttended: !record.isAttended }
        });
    }
    async removeSchedule(id, deleteAllInSeries) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id }
        });
        if (!schedule)
            throw new common_1.NotFoundException('Lịch học không tồn tại');
        if (deleteAllInSeries && schedule.recurringGroupId) {
            return this.prisma.schedule.deleteMany({
                where: { recurringGroupId: schedule.recurringGroupId }
            });
        }
        return this.prisma.schedule.delete({
            where: { id }
        });
    }
    async addStudent(scheduleId, customerId) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { _count: { select: { students: true } } },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Lịch học không tồn tại');
        if (schedule._count.students >= schedule.maxCapacity) {
            throw new common_1.BadRequestException('Lớp học đã đủ sĩ số tối đa');
        }
        const existing = await this.prisma.scheduleStudent.findUnique({
            where: { scheduleId_customerId: { scheduleId, customerId } }
        });
        if (existing)
            throw new common_1.BadRequestException('Học viên đã có trong lớp này');
        return this.prisma.scheduleStudent.create({
            data: {
                scheduleId,
                customerId,
                isAttended: false,
            }
        });
    }
    async searchCustomers(query, scheduleId) {
        const searchTerm = query.trim();
        console.log(`[SearchStudents] query="${searchTerm}", scheduleId="${scheduleId}"`);
        const where = { deletedAt: null };
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
        if (!scheduleId)
            return customers;
        const currentSchedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
            select: { courseId: true }
        });
        return customers.map(customer => {
            const isAssigned = customer.schedules.length > 0;
            let tuitionStatus = 'NOT_ENROLLED';
            const relevantOrder = customer.orders.find(order => order.items.some(item => item.courseId === currentSchedule?.courseId));
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
    async getPotentialStudents(scheduleId) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id: scheduleId },
            select: { courseId: true }
        });
        if (!schedule)
            return [];
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
            const isAssigned = customer.schedules.length > 0;
            let tuitionStatus = 'NOT_ENROLLED';
            const relevantOrder = customer.orders.find(order => order.items.some(item => item.courseId === schedule.courseId));
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
    async removeStudent(scheduleId, customerId) {
        return this.prisma.scheduleStudent.delete({
            where: { scheduleId_customerId: { scheduleId, customerId } }
        });
    }
    async bulkAddStudents(scheduleIds, customerId) {
        const results = {
            success: [],
            failed: [],
        };
        for (const scheduleId of scheduleIds) {
            try {
                await this.addStudent(scheduleId, customerId);
                results.success.push(scheduleId);
            }
            catch (err) {
                results.failed.push({
                    id: scheduleId,
                    reason: err.message || 'Lỗi không xác định',
                });
            }
        }
        return results;
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map