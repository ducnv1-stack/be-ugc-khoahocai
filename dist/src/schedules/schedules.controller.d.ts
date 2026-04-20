import { SchedulesService } from './schedules.service';
export declare class SchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: SchedulesService);
    findAll(courseId?: string): Promise<({
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
                name: string | null;
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
                name: string | null;
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
    create(data: any): Promise<{
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
    updateTime(id: string, data: {
        startTime: string;
        endTime: string;
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
    update(id: string, body: any): Promise<{
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
    toggleAttendance(id: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    removeSchedule(id: string, series: string): Promise<import(".prisma/client").Prisma.BatchPayload | {
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
    searchCustomers(q: string, scheduleId?: string): Promise<({
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
            customerId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        name: string | null;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    })[] | {
        isAssigned: boolean;
        tuitionStatus: "PAID" | "UNPAID" | "NOT_ENROLLED";
        unpaidAmount: number;
        id: string;
        email: string | null;
        name: string | null;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }[]>;
    addStudent(id: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    getPotentialStudents(id: string): Promise<{
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
            customerId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
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
        name: string | null;
        createdAt: Date;
        code: string | null;
        deletedAt: Date | null;
        phone: string;
        cccd: string | null;
        address: string | null;
        source: string | null;
        notes: string | null;
        tags: string[];
        assignedSaleId: string | null;
    }[]>;
    removeStudent(id: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    bulkAddStudents(body: {
        scheduleIds: string[];
        customerId: string;
    }): Promise<{
        success: string[];
        failed: {
            id: string;
            reason: string;
        }[];
    }>;
}
