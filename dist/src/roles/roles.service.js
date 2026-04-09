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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.role.findMany({
            include: {
                permissions: {
                    include: { permission: true }
                },
                _count: {
                    select: { users: true }
                }
            }
        });
    }
    async findAllPermissions() {
        return this.prisma.permission.findMany({
            orderBy: { module: 'asc' }
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: { include: { permission: true } }
            }
        });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async create(createRoleDto) {
        const existing = await this.prisma.role.findUnique({ where: { name: createRoleDto.name } });
        if (existing)
            throw new common_1.ConflictException('Role name already exists');
        return this.prisma.role.create({
            data: {
                name: createRoleDto.name,
                description: createRoleDto.description,
                permissions: {
                    create: createRoleDto.permissionIds?.map((id) => ({
                        permission: { connect: { id } }
                    })) || []
                }
            }
        });
    }
    async update(id, updateRoleDto) {
        const role = await this.findOne(id);
        if (role.isSystem && updateRoleDto.name && updateRoleDto.name !== role.name) {
            throw new common_1.BadRequestException('Cannot rename system roles');
        }
        if (updateRoleDto.permissionIds) {
            await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
        }
        return this.prisma.role.update({
            where: { id },
            data: {
                name: updateRoleDto.name,
                description: updateRoleDto.description,
                ...(updateRoleDto.permissionIds && {
                    permissions: {
                        create: updateRoleDto.permissionIds.map((pid) => ({
                            permission: { connect: { id: pid } }
                        }))
                    }
                })
            }
        });
    }
    async remove(id) {
        const role = await this.findOne(id);
        if (role.isSystem) {
            throw new common_1.BadRequestException('Cannot delete system roles');
        }
        const usersCount = await this.prisma.user.count({ where: { roleId: id } });
        if (usersCount > 0) {
            throw new common_1.BadRequestException('Cannot delete role that is assigned to users');
        }
        return this.prisma.role.delete({ where: { id } });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map