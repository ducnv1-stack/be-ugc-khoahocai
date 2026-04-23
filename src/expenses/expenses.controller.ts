import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('expenses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @RequirePermissions('expenses.create', 'expenses.manage')
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
    return this.expensesService.create(createExpenseDto, req.user.id);
  }

  @Get()
  @RequirePermissions('expenses.view', 'expenses.manage', 'expenses.report.view')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('costCenter') costCenter?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      category,
      costCenter,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('stats')
  @RequirePermissions('expenses.view', 'expenses.manage', 'expenses.report.view')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('expenses.view', 'expenses.manage', 'expenses.report.view')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('expenses.update', 'expenses.manage')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Patch(':id/confirm')
  @RequirePermissions('expenses.confirm', 'expenses.manage')
  confirm(@Param('id') id: string, @Request() req: any) {
    return this.expensesService.confirm(id, req.user.id);
  }

  @Patch(':id/cancel')
  @RequirePermissions('expenses.confirm', 'expenses.manage')
  cancel(@Param('id') id: string) {
    return this.expensesService.cancel(id);
  }

  @Delete(':id')
  @RequirePermissions('expenses.delete', 'expenses.manage')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
