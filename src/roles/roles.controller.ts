import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('roles')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post()
  // @RequirePermissions('roles.manage')
  create(@Body() createRoleDto: any) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  // @RequirePermissions('roles.view', 'roles.manage')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  // @RequirePermissions('roles.view', 'roles.manage')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  // @RequirePermissions('roles.manage')
  update(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  // @RequirePermissions('roles.manage')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
