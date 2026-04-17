import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(createCourseDto: CreateCourseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }[]>;
    findAllTrash(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }>;
    hardDelete(id: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }>;
    restore(id: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        totalSessions: number;
        status: string;
        deletedAt: Date | null;
    }>;
}
