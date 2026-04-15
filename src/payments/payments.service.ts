import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private socketGateway: SocketGateway,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  async handleSePayWebhook(payload: any, authHeader: string) {
    // 0. Ghi Log Webhook vào DB ngay khi nhận được (Để phục vụ debug)
    const log = await this.prisma.webhookLog.create({
      data: {
        payload,
        status: 'RECEIVED'
      }
    });

    const updateLog = async (status: string) => {
      const updatedLog = await this.prisma.webhookLog.update({
        where: { id: log.id },
        data: { status }
      });
      // Emit event to update log list in UI
      this.socketGateway.emitWebhookLogUpdated(updatedLog);
    };

    // Emit initial log receipt
    this.socketGateway.emitWebhookLogUpdated(log);

    // 1. Kiểm tra Webhook Secret
    const secret = this.configService.get<string>('SEPAY_WEBHOOK_SECRET');
    const isValid = authHeader === `Apikey ${secret}` || authHeader === `Bearer ${secret}`;

    if (!isValid) {
      this.logger.error('Unauthorized SePay Webhook attempt: Invalid secret or prefix');
      await updateLog('UNAUTHORIZED');
      throw new UnauthorizedException('Invalid Webhook Secret');
    }

    const { content, description, transferAmount, code, referenceCode, id, accountName } = payload;
    const memo = content || description || '';
    const transactionCode = `${code || referenceCode || id || ''}`;
    
    this.logger.log(`Received payment of ${transferAmount} with memo: "${memo}" from ${accountName || 'Unknown'}`);

    // Chuẩn hóa nội dung nhận được (Bỏ dấu) trước khi tìm kiếm
    const normalizedContent = this.removeAccents(memo);

    // 2. TÌM ĐƠN HÀNG (STRICT MATCHING)
    // Cấu trúc mong đợi: [Mã KH] [SĐT] [Mã Khóa]
    let order: any = null;
    const pendingOrders = await this.prisma.order.findMany({
        where: {
            status: { in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_PAID] }
        },
        include: { 
            customer: true,
            items: { include: { course: true } }
        }
    });

    // Tìm kiếm khớp chính xác 3 yếu tố
    const findStrictMatch = () => {
        for (const o of pendingOrders) {
            // Chuẩn hóa mã khách hàng và mã khóa học để so sánh không dấu
            const normalizedCustCode = this.removeAccents(o.customer.code || '').toUpperCase();
            
            const hasCode = o.customer.code && normalizedContent.toUpperCase().includes(normalizedCustCode);
            const hasPhone = o.customer.phone && normalizedContent.includes(o.customer.phone);
            const hasCourseCode = o.items.some(item => {
                const normalizedItemCourseCode = this.removeAccents(item.course.code || '').toUpperCase();
                return normalizedItemCourseCode && normalizedContent.toUpperCase().includes(normalizedItemCourseCode);
            });

            if (hasCode && hasPhone && hasCourseCode) {
                return o;
            }
        }
        return null;
    };

    // Fallback: Tìm kiếm khớp theo chuỗi Memo nguyên bản (Dành cho trường hợp khách copy nguyên nội dung gợi ý)
    const findMemoMatch = () => {
        for (const o of pendingOrders) {
            if (!o.memo) continue;
            const normalizedMemo = this.removeAccents(o.memo).toUpperCase();
            if (normalizedContent.toUpperCase().includes(normalizedMemo)) {
                return o;
            }
        }
        return null;
    };

    // Bước 1: Thử khớp chính xác 3 yếu tố
    order = findStrictMatch();
    if (order) {
        this.logger.log(`[STRICT_MATCH] Order found: ${order.id} (Customer: ${order.customer.code})`);
    } else {
        // Bước 2: Thử khớp theo chuỗi Memo nếu bước 1 thất bại
        this.logger.warn(`No strict match for memo: "${normalizedContent}". Trying fallback memo match...`);
        order = findMemoMatch();
        
        if (order) {
            this.logger.log(`[MEMO_MATCH] Fallback match found for order ${order.id} via stored memo`);
        }
    }

    if (!order) {
        this.logger.error(`[MATCH_FAILED] No matching order found for memo: "${normalizedContent}"`);
        
        // Ghi Audit Log cho trường hợp không khớp (cần duyệt tay)
        const systemAdmin = await this.prisma.user.findFirst({
            where: { role: { name: 'ADMIN' } }
        });
        
        if (systemAdmin) {
            await this.auditService.logAction({
                userId: systemAdmin.id,
                action: 'PAYMENT_MISMATCH',
                entityType: 'WEBHOOK',
                entityId: log.id,
                newData: {
                    memo: normalizedContent,
                    amount: transferAmount,
                    reason: 'Không khớp chính xác 3 yếu tố và cũng không khớp chuỗi Memo hệ thống.'
                }
            });
        }

        await updateLog('MANUAL_REVIEW');
        return { status: 'manual_review', message: 'Matching failed, manual review required' };
    }

    if (!order) {
      this.logger.warn(`No matching order found for normalized memo: ${normalizedContent}`);
      await updateLog('IGNORED');
      return { status: 'ignored', message: 'Order not found' };
    }

    // 3. Cập nhật thanh toán (Atomic Transaction)
    try {
        let finalCustomerName = order.customer.name;

        await this.prisma.$transaction(async (tx) => {
          // Lưu bản ghi giao dịch
          await tx.payment.create({
            data: {
              orderId: order.id,
              amount: transferAmount,
              transactionCode: transactionCode, 
              rawData: payload,
              status: 'SUCCESS'
            }
          });
    
          const newPaidAmount = order.paidAmount + transferAmount;
          const isFullPaid = newPaidAmount >= order.finalPrice;
    
          await tx.order.update({
            where: { id: order.id },
            data: {
              paidAmount: newPaidAmount,
              status: isFullPaid ? OrderStatus.PAID : OrderStatus.PARTIALLY_PAID,
              isLead: false
            }
          });

          // Cập nhật tên khách hàng nếu hiện tại là tên tạm
          if (accountName && (order.customer.name.includes('Khách vãng lai') || order.customer.name === order.customer.phone)) {
            finalCustomerName = accountName.toUpperCase();
            await tx.customer.update({
              where: { id: order.customerId },
              data: { name: finalCustomerName }
            });
          }
        });
        
        await updateLog('SUCCESS');
        
        // Emit event to refresh UI
        this.socketGateway.emitPaymentReceived({
          orderId: order.id,
          customerId: order.customerId,
          customerName: finalCustomerName,
          amount: transferAmount
        });

        // Create persistent notification
        const courseNames = order.items.map((i: any) => i.course.name).join(', ');
        await this.notificationsService.create({
          title: 'Thanh toán thành công',
          message: `Khách: ${finalCustomerName} - Khóa: ${courseNames} - Số tiền: ${new Intl.NumberFormat('vi-VN').format(transferAmount)}đ`,
          type: 'SUCCESS'
        });

        return { status: 'success' };
    } catch (error) {
        this.logger.error(`Error processing payment for order ${order.id}:`, error);
        await updateLog('ERROR');
        throw error;
    }
  }

  async getWebhookLogs() {
    return this.prisma.webhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async findAllPayments() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { course: true } }
          }
        }
      }
    });
  }

  private removeAccents(str: string): string {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  async getWebhookSettings() {
    return {
      url: `${this.configService.get('SERVER_URL') || 'http://localhost:3001'}/payments/webhook/sepay`,
      secret: this.configService.get('SEPAY_WEBHOOK_SECRET'),
      bankInfo: {
        id: this.configService.get('BANK_ID'),
        accountNo: this.configService.get('BANK_ACCOUNT_NO'),
        accountName: this.configService.get('BANK_ACCOUNT_NAME'),
      }
    };
  }
}
