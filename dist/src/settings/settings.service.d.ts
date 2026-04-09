import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<Record<string, any>>;
    updateSetting(key: string, value: any): Promise<{
        id: string;
        key: string;
        value: import("@prisma/client/runtime/library").JsonValue;
        updatedAt: Date;
    }>;
    updateMultipleSettings(settings: Record<string, any>): Promise<Record<string, any>>;
}
