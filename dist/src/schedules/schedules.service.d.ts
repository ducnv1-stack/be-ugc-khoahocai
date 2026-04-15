import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        courseId?: string;
    }): Promise<({
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
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
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
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
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
        notes?: string;
        isOnline?: boolean;
        recurring?: {
            daysOfWeek: number[];
            totalSessions: number;
        };
    }): Promise<{
        id: string;
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
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
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    }[]>;
    private _generateRecurringSchedules;
    updateTime(id: string, startTime: Date, endTime: Date): Promise<{
        id: string;
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        googleEventId: string | null;
        recurringGroupId: string | null;
    }>;
    update(id: string, data: {
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
        };
    }): Promise<{
        id: string;
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
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
        isOnline: boolean;
        createdAt: Date;
        notes: string | null;
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
    searchCustomers(query: string, scheduleId?: string): Promise<({
        orders: ({
            items: {
                id: string;
                price: number;
                orderId: string;
                courseId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            customerId: string;
            saleId: string;
            totalPrice: number;
            discountType: import(".prisma/client").$Enums.DiscountType | null;
            discountValue: number | null;
            finalPrice: number;
            paidAmount: number;
            qrCode: string | null;
            memo: string | null;
            memoEditable: boolean;
            locked: boolean;
            invoiceIssued: boolean;
            isLead: boolean;
        })[];
        schedules: {
            id: string;
        }[];
    } & {
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
    })[] | {
        isAssigned: boolean;
        tuitionStatus: "PAID" | "UNPAID" | "NOT_ENROLLED";
        unpaidAmount: number;
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
    getPotentialStudents(scheduleId: string): Promise<{
        isAssigned: boolean;
        tuitionStatus: "PAID" | "UNPAID" | "NOT_ENROLLED";
        debtAmount: number;
        orders: ({
            items: {
                id: string;
                price: number;
                orderId: string;
                courseId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            customerId: string;
            saleId: string;
            totalPrice: number;
            discountType: import(".prisma/client").$Enums.DiscountType | null;
            discountValue: number | null;
            finalPrice: number;
            paidAmount: number;
            qrCode: string | null;
            memo: string | null;
            memoEditable: boolean;
            locked: boolean;
            invoiceIssued: boolean;
            isLead: boolean;
        })[];
        schedules: {
            id: string;
        }[];
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
    removeStudent(scheduleId: string, customerId: string): Promise<{
        id: string;
        customerId: string;
        scheduleId: string;
        isAttended: boolean;
    }>;
}
