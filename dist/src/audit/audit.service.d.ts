import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(params: {
        userId: string;
        action: string;
        entityType: string;
        entityId: string;
        oldData?: any;
        newData?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        oldData: import("@prisma/client/runtime/library").JsonValue | null;
        newData: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        oldData: import("@prisma/client/runtime/library").JsonValue | null;
        newData: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
    })[]>;
}
