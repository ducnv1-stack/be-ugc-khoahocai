import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('customers.manage')
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any) {
    return this.customersService.create(createCustomerDto, req.user.id);
  }

  @Get('stats')
  @RequirePermissions('customers.view', 'customers.manage')
  getStats() {
    return this.customersService.getStats();
  }

  @Get()
  @RequirePermissions('customers.view', 'customers.manage')
  findAll(
    @Query('search') search?: string, 
    @Query('page') page?: string, 
    @Query('limit') limit?: string,
    @Query('type') type?: 'lead' | 'regular' | 'all'
  ) {
    return this.customersService.findAll({
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
    });
  }

  @Get('trash')
  @RequirePermissions('customers.manage')
  findAllTrash(
    @Query('search') search?: string, 
    @Query('page') page?: string, 
    @Query('limit') limit?: string
  ) {
    return this.customersService.findAll({
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      onlyDeleted: true,
    });
  }

  @Get(':id')
  @RequirePermissions('customers.view', 'customers.manage')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('customers.manage')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req: any) {
    return this.customersService.update(id, updateCustomerDto, req.user);
  }

  @Delete(':id/lead')
  @RequirePermissions('customers.manage')
  deleteLead(@Param('id') id: string) {
    return this.customersService.deleteLeadCustomer(id);
  }

  @Delete(':id/permanent')
  @RequirePermissions('customers.manage')
  hardDelete(@Param('id') id: string, @Request() req: any) {
    return this.customersService.hardDelete(id, req.user);
  }

  @Patch(':id/restore')
  @RequirePermissions('customers.manage')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.customersService.restore(id, req.user);
  }

  @Delete(':id')
  @RequirePermissions('customers.manage')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.customersService.softDelete(id, req.user);
  }
}
