import { SchedulesService } from './schedules.service';
export declare class SchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: SchedulesService);
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
    create(data: any): Promise<{
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
    updateTime(id: string, data: {
        startTime: string;
        endTime: string;
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
    }>;
    toggleAttendance(id: string, customerId: string): Promise<{
        id: string;
        customerId: string;
        scheduleId: string;
        isAttended: boolean;
    }>;
    removeSchedule(id: string, series: string): Promise<import(".prisma/client").Prisma.BatchPayload | {
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
    searchCustomers(q: string): never[] | Promise<{
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
    addStudent(id: string, customerId: string): Promise<{
        id: string;
        customerId: string;
        scheduleId: string;
        isAttended: boolean;
    }>;
}
