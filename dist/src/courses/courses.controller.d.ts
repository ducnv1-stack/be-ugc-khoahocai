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
        status: string;
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
    }>;
}
