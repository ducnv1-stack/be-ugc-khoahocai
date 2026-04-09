import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
export declare class NotificationsService {
    private prisma;
    private socketGateway;
    constructor(prisma: PrismaService, socketGateway: SocketGateway);
    create(data: {
        title: string;
        message: string;
        type?: string;
        userId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        title: string;
        message: string;
        type: string;
        isRead: boolean;
    }>;
    markAllAsRead(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
