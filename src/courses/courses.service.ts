import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code },
    });
    if (existing) {
      throw new BadRequestException('Mã khóa học đã tồn tại');
    }
    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  findAll() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!course) throw new NotFoundException('Khóa học không tồn tại');
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id); // verify exists
    
    if (updateCourseDto.code) {
      const existing = await this.prisma.course.findUnique({
        where: { code: updateCourseDto.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Mã khóa học này đã được sử dụng');
      }
    }
    
    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }
}
