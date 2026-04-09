import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        _count: {
            users: number;
        };
        permissions: ({
            permission: {
                id: string;
                name: string;
                code: string;
                module: string;
                description: string | null;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        isSystem: boolean;
    })[]>;
    findAllPermissions(): Promise<{
        id: string;
        name: string;
        code: string;
        module: string;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                name: string;
                code: string;
                module: string;
                description: string | null;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        isSystem: boolean;
    }>;
    create(createRoleDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        isSystem: boolean;
    }>;
    update(id: string, updateRoleDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        isSystem: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        isSystem: boolean;
    }>;
}
