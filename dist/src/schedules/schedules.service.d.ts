import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        _count: {
            students: number;
        };
        course: {
            id: string;
            name: string;
            code: string;
            totalSessions: number;
        };
        instructor: {
            id: string;
            name: string;
        };
        students: ({
            customer: {
                id: string;
                name: string;
                code: string | null;
                phone: string;
            };
        } & {
            id: string;
            customerId: string;
            scheduleId: string;
            isAttended: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    })[]>;
    findOne(id: string): Promise<({
        course: {
            id: string;
            name: string;
            code: string;
        };
        instructor: {
            id: string;
            name: string;
        };
        students: ({
            customer: {
                id: string;
                name: string;
                code: string | null;
                phone: string;
            };
        } & {
            id: string;
            customerId: string;
            scheduleId: string;
            isAttended: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    }) | null>;
    create(data: {
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity?: number;
        meetingUrl?: string;
        recurring?: {
            daysOfWeek: number[];
            totalSessions: number;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    } | {
        id: string;
        createdAt: Date;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    }[]>;
    updateTime(id: string, startTime: Date, endTime: Date): Promise<{
        id: string;
        createdAt: Date;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    }>;
    toggleAttendance(scheduleId: string, customerId: string): Promise<{
        id: string;
        customerId: string;
        scheduleId: string;
        isAttended: boolean;
    }>;
    removeSchedule(id: string, deleteAllInSeries: boolean): Promise<import(".prisma/client").Prisma.BatchPayload | {
        id: string;
        createdAt: Date;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    }>;
    addStudent(scheduleId: string, customerId: string): Promise<{
        id: string;
        customerId: string;
        scheduleId: string;
        isAttended: boolean;
    }>;
    searchCustomers(query: string): Promise<{
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
}
