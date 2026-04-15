import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCourseDto: CreateCourseDto): Promise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(onlyDeleted?: boolean): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    softDelete(id: string, currentUser: any): Promise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    restore(id: string, currentUser: any): Promise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
    hardDelete(id: string, currentUser: any): Promise<{
        id: string;
        name: string;
        code: string;
        price: number;
        duration: number;
        totalSessions: number;
        description: string | null;
        status: string;
        createdAt: Date;
        deletedAt: Date | null;
    }>;
}
