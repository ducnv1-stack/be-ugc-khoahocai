"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const delete_config_1 = require("../common/configs/delete.config");
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCourseDto) {
        const existing = await this.prisma.course.findUnique({
            where: { code: createCourseDto.code },
        });
        if (existing) {
            throw new common_1.BadRequestException('Mã khóa học đã tồn tại');
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
    async findOne(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
        });
        if (!course)
            throw new common_1.NotFoundException('Khóa học không tồn tại');
        return course;
    }
    async update(id, updateCourseDto) {
        await this.findOne(id);
        if (updateCourseDto.code) {
            const existing = await this.prisma.course.findUnique({
                where: { code: updateCourseDto.code },
            });
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException('Mã khóa học này đã được sử dụng');
            }
        }
        return this.prisma.course.update({
            where: { id },
            data: updateCourseDto,
        });
    }
    async softDelete(id, currentUser) {
        if (!delete_config_1.DELETE_CONFIG.ALLOW_ADMIN_DELETE) {
            throw new common_1.BadRequestException('Tính năng xóa hiện đang bị vô hiệu hóa');
        }
        if (currentUser.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Chỉ ADMIN mới có quyền xóa dữ liệu');
        }
        await this.findOne(id);
        return this.prisma.course.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async restore(id, currentUser) {
        if (currentUser.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Chỉ ADMIN mới có quyền khôi phục dữ liệu');
        }
        const course = await this.prisma.course.findFirst({
            where: { id, deletedAt: { not: null } }
        });
        if (!course) {
            throw new common_1.NotFoundException('Không tìm thấy khóa học trong thùng rác');
        }
        return this.prisma.course.update({
            where: { id },
            data: { deletedAt: null }
        });
    }
    async hardDelete(id, currentUser) {
        if (!delete_config_1.DELETE_CONFIG.ALLOW_ADMIN_DELETE) {
            throw new common_1.BadRequestException('Tính năng xóa hiện đang bị vô hiệu hóa');
        }
        if (currentUser.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Chỉ ADMIN mới có quyền xóa vĩnh viễn dữ liệu');
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
            throw new common_1.BadRequestException('Chỉ có thể xóa vĩnh viễn dữ liệu đã nằm trong thùng rác');
        }
        if (course._count.orderItems > 0 || course._count.schedules > 0) {
            throw new common_1.BadRequestException(`Không thể xóa vĩnh viễn khóa học này vì đang có ${course._count.orderItems} đơn hàng và ${course._count.schedules} lịch học liên quan. Bạn nên ẩn (ACTIVE -> INACTIVE) khóa học thay vì xóa vĩnh viễn.`);
        }
        return this.prisma.course.delete({
            where: { id }
        });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map