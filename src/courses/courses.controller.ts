import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @RequirePermissions('courses.manage')
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @RequirePermissions('courses.view', 'courses.manage')
  findAll() {
    return this.coursesService.findAll(false);
  }

  @Get('trash')
  @RequirePermissions('courses.manage')
  findAllTrash() {
    return this.coursesService.findAll(true);
  }

  @Get(':id')
  @RequirePermissions('courses.view', 'courses.manage')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('courses.manage')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id/permanent')
  @RequirePermissions('courses.manage')
  hardDelete(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.hardDelete(id, req.user);
  }

  @Patch(':id/restore')
  @RequirePermissions('courses.manage')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.restore(id, req.user);
  }

  @Delete(':id')
  @RequirePermissions('courses.manage')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.softDelete(id, req.user);
  }
}
