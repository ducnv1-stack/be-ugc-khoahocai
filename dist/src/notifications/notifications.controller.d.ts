import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
    }>;
    markAllAsRead(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
