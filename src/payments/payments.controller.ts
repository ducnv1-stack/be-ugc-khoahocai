import { Controller, Post, Body, Headers, Get, UseGuards } from '@nestjs/common';
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
  getWebhookLogs() {
    return this.paymentsService.getWebhookLogs();
  }
}
