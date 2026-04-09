import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            permissions: any;
        };
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        roleId: string;
        createdAt: Date;
        role: {
            name: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            permissions: any;
        };
    }>;
    getProfile(req: any): any;
}
