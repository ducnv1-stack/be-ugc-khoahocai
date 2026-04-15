import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        courseId?: string;
    }): Promise<({
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
            scheduleId: string;
            customerId: string;
            isAttended: boolean;
        })[];
        _count: {
            students: number;
        };
    } & {
        id: string;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
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
            scheduleId: string;
            customerId: string;
            isAttended: boolean;
        })[];
    } & {
        id: string;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
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
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
    } | {
        id: string;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
    }[]>;
    private _generateRecurringSchedules;
    updateTime(id: string, startTime: Date, endTime: Date): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
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
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
    }>;
    toggleAttendance(scheduleId: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    removeSchedule(id: string, deleteAllInSeries: boolean): Promise<{
        id: string;
        courseId: string;
        instructorId: string;
        startTime: Date;
        endTime: Date;
        maxCapacity: number;
        meetingUrl: string | null;
        notes: string | null;
        isOnline: boolean;
        googleEventId: string | null;
        recurringGroupId: string | null;
        createdAt: Date;
    } | import(".prisma/client").Prisma.BatchPayload>;
    addStudent(scheduleId: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    searchCustomers(query: string, scheduleId?: string): Promise<({
        schedules: {
            id: string;
        }[];
        orders: ({
            items: {
                id: string;
                courseId: string;
                price: number;
                orderId: string;
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
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        name: string;
        code: string | null;
        deletedAt: Date | null;
        email: string | null;
        phone: string;
        source: string | null;
        tags: string[];
        assignedSaleId: string | null;
    })[] | {
        isAssigned: boolean;
        tuitionStatus: "PAID" | "UNPAID" | "NOT_ENROLLED";
        unpaidAmount: number;
        id: string;
        notes: string | null;
        createdAt: Date;
        name: string;
        code: string | null;
        deletedAt: Date | null;
        email: string | null;
        phone: string;
        source: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }[]>;
    getPotentialStudents(scheduleId: string): Promise<{
        isAssigned: boolean;
        tuitionStatus: "PAID" | "UNPAID" | "NOT_ENROLLED";
        debtAmount: number;
        schedules: {
            id: string;
        }[];
        orders: ({
            items: {
                id: string;
                courseId: string;
                price: number;
                orderId: string;
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
        id: string;
        notes: string | null;
        createdAt: Date;
        name: string;
        code: string | null;
        deletedAt: Date | null;
        email: string | null;
        phone: string;
        source: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }[]>;
    removeStudent(scheduleId: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    bulkAddStudents(scheduleIds: string[], customerId: string): Promise<{
        success: string[];
        failed: {
            id: string;
            reason: string;
        }[];
    }>;
}
