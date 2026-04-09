import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { DiscountType } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @RequirePermissions('orders.manage')
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    const saleId = req.user.id;
    return this.ordersService.create(createOrderDto, saleId);
  }

  @Get()
  @RequirePermissions('orders.view', 'orders.manage')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('orders.view', 'orders.manage')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/memo')
  @RequirePermissions('customers.manage')
  updateMemo(@Param('id') id: string, @Body('memo') memo: string) {
    return this.ordersService.updateMemo(id, memo);
  }

  @Patch(':id/price')
  @RequirePermissions('customers.manage')
  updatePrice(
    @Param('id') id: string, 
    @Body() data: { discountType?: DiscountType, discountValue?: number, finalPrice: number },
    @Request() req: any
  ) {
    return this.ordersService.updatePrice(id, data, req.user.id);
  }

  @Patch(':id/paid-amount')
  @RequirePermissions('customers.manage')
  updatePaidAmount(
    @Param('id') id: string,
    @Body('paidAmount') paidAmount: number,
    @Request() req: any
  ) {
    return this.ordersService.updatePaidAmount(id, paidAmount, req.user.id);
  }

  @Patch(':id/invoice-status')
  @RequirePermissions('customers.manage')
  updateInvoiceStatus(
    @Param('id') id: string,
    @Body('invoiceIssued') invoiceIssued: boolean,
    @Request() req: any
  ) {
    return this.ordersService.updateInvoiceStatus(id, invoiceIssued, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('customers.manage')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.remove(id, req.user.id);
  }
}
