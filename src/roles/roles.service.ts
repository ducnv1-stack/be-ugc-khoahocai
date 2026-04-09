import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } }
      }
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(createRoleDto: any) {
    const existing = await this.prisma.role.findUnique({ where: { name: createRoleDto.name } });
    if (existing) throw new ConflictException('Role name already exists');

    return this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        permissions: {
          create: createRoleDto.permissionIds?.map((id: string) => ({
            permission: { connect: { id } }
          })) || []
        }
      }
    });
  }

  async update(id: string, updateRoleDto: any) {
    const role = await this.findOne(id);
    if (role.isSystem && updateRoleDto.name && updateRoleDto.name !== role.name) {
      throw new BadRequestException('Cannot rename system roles');
    }

    if (updateRoleDto.permissionIds) {
      // Xóa hết permissions cũ và thêm mới (cách đơn giản nhất)
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        ...(updateRoleDto.permissionIds && {
          permissions: {
            create: updateRoleDto.permissionIds.map((pid: string) => ({
              permission: { connect: { id: pid } }
            }))
          }
        })
      }
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }
    
    // Fallback users? In a real system we would reassign or block deletion if users exist
    const usersCount = await this.prisma.user.count({ where: { roleId: id } });
    if (usersCount > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
