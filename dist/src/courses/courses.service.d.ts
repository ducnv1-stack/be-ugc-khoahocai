import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCourseDto: CreateCourseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        status: string;
        totalSessions: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        status: string;
        totalSessions: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        status: string;
        totalSessions: number;
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        code: string;
        description: string | null;
        price: number;
        duration: number;
        status: string;
        totalSessions: number;
    }>;
}
