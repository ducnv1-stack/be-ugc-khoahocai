import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        roleId: string;
        createdAt: Date;
        role: {
            name: string;
        };
    }>;
    findByEmail(email: string): Promise<({
        role: {
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
        };
    } & {
        id: string;
        email: string;
        password: string;
        name: string;
        roleId: string;
        isOnline: boolean;
        lastAssignedAt: Date | null;
        createdAt: Date;
    }) | null>;
    findById(id: string): Promise<({
        role: {
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
        };
    } & {
        id: string;
        email: string;
        password: string;
        name: string;
        roleId: string;
        isOnline: boolean;
        lastAssignedAt: Date | null;
        createdAt: Date;
    }) | null>;
    updateOnlineStatus(userId: string, isOnline: boolean): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        roleId: string;
        isOnline: boolean;
        lastAssignedAt: Date | null;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        roleId: string;
        isOnline: boolean;
        createdAt: Date;
        role: {
            id: string;
            name: string;
        };
    }[]>;
    update(id: string, dto: {
        name?: string;
        email?: string;
        roleId?: string;
        password?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        roleId: string;
        role: {
            name: string;
        };
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        roleId: string;
        isOnline: boolean;
        lastAssignedAt: Date | null;
        createdAt: Date;
    }>;
}
