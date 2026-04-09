import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAllPermissions(): Promise<{
        id: string;
        name: string;
        code: string;
        module: string;
        description: string | null;
    }[]>;
    create(createRoleDto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
        isSystem: boolean;
    }>;
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
