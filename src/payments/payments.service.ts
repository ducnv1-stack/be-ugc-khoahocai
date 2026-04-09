import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private socketGateway: SocketGateway,
    private notificationsService: NotificationsService,
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

    const { content, description, transferAmount, code, referenceCode, id } = payload;
    const memo = content || description || '';
    const transactionCode = `${code || referenceCode || id || ''}`;
    
    this.logger.log(`Received payment of ${transferAmount} with memo: "${memo}"`);

    // Chuẩn hóa nội dung nhận được (Bỏ dấu) trước khi tìm kiếm
    const normalizedContent = this.removeAccents(memo);

    // 2. TÌM ĐƠN HÀNG (2 Bước)
    let order: any = null;

    // Bước A: Tìm kiếm chính xác theo trường Memo
    order = await this.prisma.order.findFirst({
        where: {
            memo: { equals: normalizedContent, mode: 'insensitive' },
            status: { in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_PAID] }
        },
        include: { 
            customer: true,
            items: { include: { course: true } }
        }
    });

    // Bước B: SMART MATCH (Khớp một phần) - Nếu không khớp 100%, tìm theo Mã Khách Hàng hoặc nội dung
    if (!order) {
        const pendingOrders = await this.prisma.order.findMany({
            where: {
                status: { in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_PAID] }
            },
            include: { 
                customer: true,
                items: { include: { course: true } }
            }
        });

        // Ưu tiên 1: Tìm theo Mã Khách Hàng (Customer Code) xuất hiện trong nội dung
        const matchesByCode = pendingOrders.filter(o => 
            o.customer.code && normalizedContent.toUpperCase().includes(o.customer.code.toUpperCase())
        );

        if (matchesByCode.length > 0) {
            // Nếu khách hàng có nhiều đơn, ưu tiên đơn có số tiền khớp nhất hoặc đơn gần nhất
            order = matchesByCode.find(o => o.finalPrice - o.paidAmount === transferAmount) || matchesByCode[0];
            this.logger.log(`Found order by Customer Code "${order.customer.code}" for customer ${order.customer.name}`);
        } else {
            // Ưu tiên 2: Tìm theo chuỗi Memo dài nhất khớp (Logic cũ)
            const substringMatches = pendingOrders
                .filter(o => o.memo && normalizedContent.toLowerCase().includes(this.removeAccents(o.memo).toLowerCase()))
                .sort((a, b) => (b.memo?.length || 0) - (a.memo?.length || 0));

            if (substringMatches.length > 0) {
                order = substringMatches[0];
                this.logger.log(`Smart matched memo "${order.memo}" inside "${normalizedContent}"`);
            }
        }
    }

    // Bước C: Nếu vẫn không thấy, fallback sang logic Tách MãKhóa + SĐT
    if (!order) {
        const parts = normalizedContent.split(' ').filter(p => p.trim() !== '');
        if (parts.length >= 2) {
            const courseCode = parts[0].toUpperCase();
            const phone = parts[parts.length - 1];

            order = await this.prisma.order.findFirst({
                where: {
                    status: { in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_PAID] },
                    customer: { phone: { contains: phone } },
                    items: {
                        some: {
                            course: { code: { equals: courseCode, mode: 'insensitive' } }
                        }
                    }
                },
                include: { 
                    customer: true,
                    items: { include: { course: true } }
                }
            });
        }
    }

    if (!order) {
      this.logger.warn(`No matching order found for normalized memo: ${normalizedContent}`);
      await updateLog('IGNORED');
      return { status: 'ignored', message: 'Order not found' };
    }

    // 3. Cập nhật thanh toán (Atomic Transaction)
    try {
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
              status: isFullPaid ? OrderStatus.PAID : OrderStatus.PARTIALLY_PAID
            }
          });
        });
        
        await updateLog('SUCCESS');
        this.logger.log(`Successfully updated order ${order.id} for customer ${order.customer.name}`);
        
        // Emit event to refresh customer data/orders in UI
        this.socketGateway.emitPaymentReceived({
          orderId: order.id,
          customerId: order.customerId,
          customerName: order.customer.name,
          amount: transferAmount
        });

        // Create persistent notification
        const courseNames = order.items.map((i: any) => i.course.name).join(', ');
        await this.notificationsService.create({
          title: 'Thanh toán thành công',
          message: `Khách: ${order.customer.name} (${order.customer.phone}) - Khóa: ${courseNames} - Số tiền: ${new Intl.NumberFormat('vi-VN').format(transferAmount)}đ`,
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
