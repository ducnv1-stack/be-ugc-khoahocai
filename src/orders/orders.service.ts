import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto, DiscountType as DtoDiscountType } from './dto/create-order.dto';
import { OrderStatus, DiscountType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { CustomersService } from '../customers/customers.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private auditService: AuditService,
    private customersService: CustomersService,
    private socketGateway: SocketGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto, saleId: string) {
    const { customerId, customerName, customerPhone, customerCccd, customerAddress, courseIds, discountType, discountValue, paymentAmount, primaryCourseId, customerNotes } = createOrderDto;

    let targetCustomerId = customerId;
    let isLead = false;

    // 1. Xử lý Khách hàng (Tự động tạo nếu chỉ có SĐT)
    if (!targetCustomerId) {
      if (!customerPhone) throw new BadRequestException('Vui lòng cung cấp customerId hoặc customerPhone');
      
      // Kiểm tra xem SĐT đã tồn tại chưa
      let customer = await this.prisma.customer.findUnique({ where: { phone: customerPhone } });
      
      if (!customer) {
        // Tạo khách hàng mới (Lead)
        const nextCode = await this.customersService.generateNextCode();
        customer = await this.prisma.customer.create({
          data: {
            code: nextCode,
            name: customerName || `Khách vãng lai ${customerPhone}`,
            phone: customerPhone,
            cccd: customerCccd,
            address: customerAddress,
            assignedSaleId: saleId,
            notes: customerNotes || 'Khách hàng tạo nhanh từ luồng QR'
          }
        });
      } else {
        if (customerCccd || customerAddress) {
          customer = await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
              ...(customerCccd && { cccd: customerCccd }),
              ...(customerAddress && { address: customerAddress })
            }
          });
        }
      }
      targetCustomerId = customer.id;
      isLead = true;
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: targetCustomerId },
    });
    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
    });
    if (courses.length !== courseIds.length) {
      throw new BadRequestException('Một hoặc nhiều khóa học không tồn tại');
    }

    const totalPrice = courses.reduce((acc, curr) => acc + curr.price, 0);

    let finalPrice = totalPrice;
    let prismaDiscountType: DiscountType | null = null;
    if (discountType) {
        prismaDiscountType = discountType === DtoDiscountType.PERCENT ? DiscountType.PERCENT : DiscountType.FIXED;
        const val = discountValue || 0;
        if (prismaDiscountType === DiscountType.PERCENT) {
            finalPrice = totalPrice * (1 - val / 100);
        } else {
            finalPrice = Math.max(0, totalPrice - val);
        }
    }

    let primaryCourse = courses.find(c => c.id === primaryCourseId);
    if (!primaryCourse && courses.length > 0) {
      primaryCourse = courses[0];
    }
    
    // Tạo Memo: [MãKH] [SĐT] [MãKhóa] (Tối ưu cho việc quét tự động chính xác cao)
    const rawMemo = `${customer.code || ''} ${customer.phone} ${primaryCourse?.code || 'UGC'}`.toUpperCase();
    const memo = this.removeAccents(rawMemo).trim();

    const amountToPay = paymentAmount || finalPrice;
    const qrUrl = this.generateQrUrl(amountToPay, memo);

    const order: any = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: targetCustomerId,
          saleId,
          totalPrice,
          discountType: prismaDiscountType,
          discountValue : discountValue || 0,
          finalPrice,
          paidAmount: 0,
          status: OrderStatus.PENDING,
          qrCode: qrUrl,
          memo,
          memoEditable: true,
          isLead,
          items: {
            create: courses.map(c => ({
              courseId: c.id,
              price: c.price,
            }))
          }
        } as any,
        include: {
          items: { include: { course: true } },
          customer: true
        }
      });
      return newOrder;
    });

    await this.auditService.logAction({
      userId: saleId,
      action: isLead ? 'QUICK_CREATE_ORDER' : 'CREATE_ORDER',
      entityType: 'ORDER',
      entityId: order.id,
      newData: {
        totalPrice: order.totalPrice,
        finalPrice: order.finalPrice,
        isLead,
        courses: courses.map(c => c.code).join(', '),
        context: { 
          customerName: order.customer?.name, 
          customerPhone: order.customer?.phone,
        }
      }
    });

    // Emit realtime event sau khi mọi thứ (bao gồm Order) đã xong để FE load đầy đủ
    if (isLead) {
      this.socketGateway.emitCustomerCreated(order.customer || order);
    }

    return order;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: { select: { name: true, phone: true } },
        items: { include: { course: true } },
        sale: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { course: true } },
        payments: true,
        sale: { select: { name: true } }
      }
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async updateMemo(id: string, newMemo: string) {
    const order: any = await this.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    const normalizedMemo = this.removeAccents(newMemo).toUpperCase().trim();

    // Khi cập nhật Memo, ta cập nhật lại luôn link QR cho khớp nội dung mới
    const amountToPay = order.finalPrice - order.paidAmount;
    const newQrUrl = this.generateQrUrl(amountToPay, normalizedMemo);

    return this.prisma.order.update({
      where: { id },
      data: {
        memo: normalizedMemo,
        qrCode: newQrUrl
      }
    });
  }

  async updatePrice(id: string, data: { discountType?: DiscountType, discountValue?: number, finalPrice: number }, userId: string) {
    const order: any = await this.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    const { discountType, discountValue, finalPrice } = data;
    
    // Tính toán lại trạng thái dựa trên số tiền đã đóng và giá cuối mới
    let newStatus: OrderStatus = OrderStatus.PENDING;
    if (order.paidAmount >= finalPrice) {
      newStatus = OrderStatus.PAID;
    } else if (order.paidAmount > 0) {
      newStatus = OrderStatus.PARTIALLY_PAID;
    }

    // Cập nhật lại QR code dựa trên số tiền còn nợ mới
    const remainingToPay = Math.max(0, finalPrice - order.paidAmount);
    const newQrUrl = this.generateQrUrl(remainingToPay, order.memo);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        discountType,
        discountValue,
        finalPrice,
        status: newStatus,
        qrCode: newQrUrl
      }
    });

    await this.auditService.logAction({
      userId,
      action: 'UPDATE_ORDER_PRICE',
      entityType: 'ORDER',
      entityId: id,
      oldData: { 
        finalPrice: order.finalPrice, 
        discountType: order.discountType, 
        discountValue: order.discountValue,
        context: { 
          customerName: order.customer?.name, 
          customerPhone: order.customer?.phone,
          customerCode: order.customer?.code 
        }
      },
      newData: { finalPrice, discountType, discountValue },
    });

    return updatedOrder;
  }

  async updatePaidAmount(id: string, paidAmount: number, userId: string) {
    const order: any = await this.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    let newStatus: OrderStatus = OrderStatus.PENDING;
    if (paidAmount >= order.finalPrice) {
      newStatus = OrderStatus.PAID;
    } else if (paidAmount > 0) {
      newStatus = OrderStatus.PARTIALLY_PAID;
    }

    const remainingToPay = Math.max(0, order.finalPrice - paidAmount);
    const newQrUrl = this.generateQrUrl(remainingToPay, order.memo);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        paidAmount,
        status: newStatus,
        qrCode: newQrUrl
      }
    });

    await this.auditService.logAction({
      userId,
      action: 'UPDATE_PAID_AMOUNT',
      entityType: 'ORDER',
      entityId: id,
      oldData: { 
        paidAmount: order.paidAmount, 
        status: order.status,
        context: { 
          customerName: order.customer?.name, 
          customerPhone: order.customer?.phone,
          customerCode: order.customer?.code 
        }
      },
      newData: { paidAmount, status: newStatus },
    });

    return updatedOrder;
  }

  async updateInvoiceStatus(id: string, invoiceIssued: boolean, userId: string) {
    const order: any = await this.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { invoiceIssued }
    });

    await this.auditService.logAction({
      userId,
      action: 'UPDATE_INVOICE_STATUS',
      entityType: 'ORDER',
      entityId: id,
      oldData: { 
        invoiceIssued: order.invoiceIssued,
        context: { 
          customerName: order.customer?.name, 
          customerPhone: order.customer?.phone,
          customerCode: order.customer?.code 
        }
      },
      newData: { invoiceIssued },
    });

    return updatedOrder;
  }

  async remove(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    
    return this.prisma.$transaction(async (tx) => {
      // Xóa các bảng liên quan trước
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.orderHistory.deleteMany({ where: { orderId: id } });
      await tx.payment.deleteMany({ where: { orderId: id } });
      await tx.refund.deleteMany({ where: { orderId: id } });

      // Cuối cùng xóa đơn hàng
      const deletedOrder = await tx.order.delete({
        where: { id }
      });

      await this.auditService.logAction({
        userId,
        action: 'DELETE_ORDER',
        entityType: 'ORDER',
        entityId: id,
        oldData: { 
          status: order.status, 
          total: order.totalPrice,
          context: { 
            customerName: order.customer?.name, 
            customerPhone: order.customer?.phone,
            customerCode: order.customer?.code 
          }
        },
      });

      return deletedOrder;
    });
  }

  private removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  private generateQrUrl(amount: number, memo: string): string {
    const bankId = this.configService.get<string>('BANK_ID') || 'MB';
    const accountNo = this.configService.get<string>('BANK_ACCOUNT_NO') || '0000000000';
    const accountName = this.configService.get<string>('BANK_ACCOUNT_NAME') || '';
    
    // Sử dụng VietQR.io - API sạch và chuẩn hơn
    const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png`;
    const params = new URLSearchParams({
      amount: Math.round(amount).toString(),
      addInfo: memo,
      accountName: accountName
    });
    return `${baseUrl}?${params.toString()}`;
  }
}
