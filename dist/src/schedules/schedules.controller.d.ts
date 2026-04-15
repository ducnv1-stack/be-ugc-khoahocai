import { SchedulesService } from './schedules.service';
export declare class SchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: SchedulesService);
    findAll(courseId?: string): Promise<({
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
        courseId: string;
        id: string;
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
        courseId: string;
        id: string;
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
    create(data: any): Promise<{
        courseId: string;
        id: string;
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
        courseId: string;
        id: string;
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
    updateTime(id: string, data: {
        startTime: string;
        endTime: string;
    }): Promise<{
        courseId: string;
        id: string;
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
    update(id: string, body: any): Promise<{
        courseId: string;
        id: string;
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
    toggleAttendance(id: string, customerId: string): Promise<{
        id: string;
        scheduleId: string;
        customerId: string;
        isAttended: boolean;
    }>;
    removeSchedule(id: string, series: string): Promise<{
        courseId: string;
        id: string;
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
    searchCustomers(q: string, scheduleId?: string): Promise<({
        schedules: {
            id: string;
        }[];
        orders: ({
            items: {
                courseId: string;
                id: string;
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
        schedules: {
            id: string;
        }[];
        orders: ({
            items: {
                courseId: string;
                id: string;
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
