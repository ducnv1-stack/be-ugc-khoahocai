import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    update(id: string, dto: any): Promise<{
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
