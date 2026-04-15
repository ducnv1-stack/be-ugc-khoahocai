import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { DELETE_CONFIG } from '../common/configs/delete.config';

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

  findAll(onlyDeleted = false) {
    return this.prisma.course.findMany({
      where: {
        deletedAt: onlyDeleted ? { not: null } : null,
      },
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

  async softDelete(id: string, currentUser: any) {
    if (!DELETE_CONFIG.ALLOW_ADMIN_DELETE) {
      throw new BadRequestException('Tính năng xóa hiện đang bị vô hiệu hóa');
    }

    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Chỉ ADMIN mới có quyền xóa dữ liệu');
    }

    await this.findOne(id); // verify exists

    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Chỉ ADMIN mới có quyền khôi phục dữ liệu');
    }

    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: { not: null } }
    });

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học trong thùng rác');
    }

    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  async hardDelete(id: string, currentUser: any) {
    if (!DELETE_CONFIG.ALLOW_ADMIN_DELETE) {
      throw new BadRequestException('Tính năng xóa hiện đang bị vô hiệu hóa');
    }

    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Chỉ ADMIN mới có quyền xóa vĩnh viễn dữ liệu');
    }

    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: { not: null } },
      include: {
        _count: {
          select: {
            orderItems: true,
            schedules: true
          }
        }
      }
    });

    if (!course) {
      throw new BadRequestException('Chỉ có thể xóa vĩnh viễn dữ liệu đã nằm trong thùng rác');
    }

    // Kiểm tra ràng buộc dữ liệu theo yêu cầu Lựa chọn 1
    if (course._count.orderItems > 0 || course._count.schedules > 0) {
      throw new BadRequestException(
        `Không thể xóa vĩnh viễn khóa học này vì đang có ${course._count.orderItems} đơn hàng và ${course._count.schedules} lịch học liên quan. Bạn nên ẩn (ACTIVE -> INACTIVE) khóa học thay vì xóa vĩnh viễn.`
      );
    }

    return this.prisma.course.delete({
      where: { id }
    });
  }
}
