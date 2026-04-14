import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch, Delete } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.schedulesService.create(data);
  }

  @Patch(':id/time')
  updateTime(@Param('id') id: string, @Body() data: { startTime: string; endTime: string }) {
    return this.schedulesService.updateTime(id, new Date(data.startTime), new Date(data.endTime));
  }

  @Patch(':id/students/:customerId/attendance')
  toggleAttendance(@Param('id') id: string, @Param('customerId') customerId: string) {
    return this.schedulesService.toggleAttendance(id, customerId);
  }

  @Delete(':id')
  removeSchedule(@Param('id') id: string, @Query('series') series: string) {
    return this.schedulesService.removeSchedule(id, series === 'true');
  }

  @Get('search-customers')
  searchCustomers(@Query('q') q: string) {
    if (!q || q.length < 2) return [];
    return this.schedulesService.searchCustomers(q);
  }

  @Post(':id/students')
  addStudent(@Param('id') id: string, @Body('customerId') customerId: string) {
    return this.schedulesService.addStudent(id, customerId);
  }
}
