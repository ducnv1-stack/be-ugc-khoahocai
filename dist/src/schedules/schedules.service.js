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
                }
            });
        }
        const recurringGroupId = (0, uuid_1.v4)();
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
                    recurringGroupId,
                });
                currentCount++;
            }
            currentDate = (0, date_fns_1.addDays)(currentDate, 1);
            if (schedules.length > 100)
                break;
        }
        return this.prisma.$transaction(schedules.map(s => this.prisma.schedule.create({ data: s })));
    }
    async updateTime(id, startTime, endTime) {
        return this.prisma.schedule.update({
            where: { id },
            data: { startTime, endTime }
        });
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
    async searchCustomers(query) {
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
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map