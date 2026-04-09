import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('revenue-chart')
  getRevenueChart(@Query('year') year?: string) {
    return this.statsService.getRevenueChart(year ? parseInt(year) : undefined);
  }

  @Get('top-courses')
  getTopCourses(@Query('limit') limit?: string) {
    return this.statsService.getTopCourses(limit ? parseInt(limit) : 5);
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit?: string) {
    return this.statsService.getRecentOrders(limit ? parseInt(limit) : 5);
  }
}
