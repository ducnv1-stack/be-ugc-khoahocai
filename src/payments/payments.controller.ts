import { Controller, Post, Body, Headers, Get, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('payments.view', 'orders.view', 'orders.manage')
  findAll() {
    return this.paymentsService.findAllPayments();
  }

  @Post('webhook/sepay')
  @HttpCode(HttpStatus.OK)
  handleSePayWebhook(
    @Body() payload: any,
    @Headers('authorization') authHeader: string
  ) {
    return this.paymentsService.handleSePayWebhook(payload, authHeader);
  }

  @Get('webhook/sepay')
  verifyWebhook() {
    return { status: 'ok', message: 'SePay Webhook endpoint is active' };
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('payments.settings.view', 'orders.manage')
  getSettings() {
    return this.paymentsService.getWebhookSettings();
  }

  @Get('webhook-logs')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('payments.webhook-logs.view', 'orders.manage')
  getWebhookLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('transferType') transferType?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.getWebhookLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      transferType,
      search,
    });
  }
}
