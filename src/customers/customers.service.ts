import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditService } from '../audit/audit.service';
import { DELETE_CONFIG } from '../common/configs/delete.config';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private socketGateway: SocketGateway,
  ) {}

  async generateNextCode() {
    // Tự động tạo mã khách hàng (KHxxxx)
    const lastCustomer = await this.prisma.customer.findFirst({
      where: { code: { startsWith: 'KH' } },
      orderBy: { code: 'desc' }
    });

    let nextCode = 'KH1000';
    if (lastCustomer && lastCustomer.code) {
      const lastNum = parseInt(lastCustomer.code.replace('KH', ''), 10);
      nextCode = `KH${lastNum + 1}`;
    }
    return nextCode;
  }

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: createCustomerDto.phone },
    });
    
    if (existing) {
      throw new ConflictException('Số điện thoại này đã tồn tại trong danh sách khách hàng');
    }

    const nextCode = await this.generateNextCode();

    const newCustomer = await this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        code: nextCode,
        assignedSaleId: createCustomerDto.assignedSaleId || userId
      },
      include: {
        assignedSale: { select: { name: true } }
      }
    });
    
    await this.auditService.logAction({
      userId,
      action: 'CREATE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: newCustomer.id,
      newData: {
        name: newCustomer.name,
        phone: newCustomer.phone,
        code: newCustomer.code
      }
    });

    // Emit realtime event
    this.socketGateway.emitCustomerCreated(newCustomer);

    return newCustomer;
  }

  async findAll(query?: { search?: string; skip?: number; take?: number; onlyDeleted?: boolean }) {
    const { search, skip = 0, take = 50, onlyDeleted = false } = query || {};
    
    const customers = await this.prisma.customer.findMany({
      where: {
        deletedAt: onlyDeleted ? { not: null } : null,
        OR: search ? [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        assignedSale: {
          select: { name: true }
        },
        orders: {
          include: {
            items: { include: { course: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        schedules: {
          include: {
            schedule: {
              include: {
                course: true,
                instructor: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    // Tính field isLead: Khách tạm nếu CHƯA có đơn hàng nào HOẶC tất cả đơn đều chưa thanh toán (PAID)
    return customers.map(c => ({
      ...c,
      isLead: c.orders.length === 0 || c.orders.every(o => o.status !== 'PAID'),
    }));
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: { include: { course: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng này');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, currentUser: any) {
    const customer = await this.findOne(id);

    if (updateCustomerDto.phone) {
      const existing = await this.prisma.customer.findUnique({
        where: { phone: updateCustomerDto.phone },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Số điện thoại này đã được sử dụng bởi khách hàng khác');
      }
    }

    // Kiểm tra quyền đổi nhân viên phụ trách
    if (updateCustomerDto.assignedSaleId && updateCustomerDto.assignedSaleId !== customer.assignedSaleId) {
      if (currentUser.role !== 'ADMIN') {
        throw new BadRequestException('Chỉ ADMIN mới có quyền thay đổi nhân viên phụ trách');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async softDelete(id: string, currentUser: any) {
    if (!DELETE_CONFIG.ALLOW_ADMIN_DELETE) {
      throw new BadRequestException('Tính năng xóa hiện đang bị vô hiệu hóa');
    }

    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Chỉ ADMIN mới có quyền xóa dữ liệu');
    }

    const customer = await this.findOne(id);
    
    await this.auditService.logAction({
      userId: currentUser.id,
      action: 'SOFT_DELETE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: id,
      oldData: { name: customer.name, phone: customer.phone }
    });

    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Chỉ ADMIN mới có quyền khôi phục dữ liệu');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: { not: null } }
    });

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng trong thùng rác');
    }

    await this.auditService.logAction({
      userId: currentUser.id,
      action: 'RESTORE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: id,
      newData: { name: customer.name, phone: customer.phone }
    });

    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  async hardDelete(id: string, currentUser: any) {
    if (!DELETE_CONFIG.ALLOW_ADMIN_DELETE) {
      throw new BadRequestException('Tính năng xóa hiện đang bị vô hiệu hóa');
    }

    if (currentUser.role !== 'ADMIN') {
      throw new BadRequestException('Chỉ ADMIN mới có quyền xóa vĩnh viễn dữ liệu');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: { not: null } },
      include: { orders: true }
    });

    if (!customer) {
      throw new BadRequestException('Chỉ có thể xóa vĩnh viễn dữ liệu đã nằm trong thùng rác');
    }

    // Kiểm tra an toàn: không xóa nếu đã có thanh toán (tùy chọn, nhưng nên giữ để an toàn kế toán)
    const hasPaidOrder = customer.orders.some(o => o.paidAmount > 0);
    if (hasPaidOrder) {
      throw new BadRequestException('Không thể xóa vĩnh viễn khách hàng đã có lịch sử thanh toán');
    }

    await this.auditService.logAction({
      userId: currentUser.id,
      action: 'HARD_DELETE_CUSTOMER',
      entityType: 'CUSTOMER',
      entityId: id,
      oldData: { name: customer.name, phone: customer.phone }
    });

    // Thực hiện xóa cứng tương tự deleteLeadCustomer nhưng dành cho khách đã trong trash
    await this.prisma.$transaction(async (tx) => {
      for (const order of customer.orders) {
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.payment.deleteMany({ where: { orderId: order.id } });
        await tx.orderHistory.deleteMany({ where: { orderId: order.id } });
        await tx.refund.deleteMany({ where: { orderId: order.id } });
        await tx.order.delete({ where: { id: order.id } });
      }
      await tx.customer.delete({ where: { id } });
    });

    return { message: 'Đã xóa vĩnh viễn khách hàng thành công' };
  }

  // Xóa cứng khách tạm (chỉ dùng khi isLead và chưa thanh toán)
  async deleteLeadCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { orders: true }
    });

    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    // Kiểm tra an toàn: không xóa nếu đã có thanh toán
    const hasPaidOrder = customer.orders.some(o => o.paidAmount > 0);
    if (hasPaidOrder) {
      throw new BadRequestException('Không thể xóa khách hàng đã có lịch sử thanh toán');
    }

    // Xóa cứng: Xóa đơn hàng liên quan trước
    await this.prisma.$transaction(async (tx) => {
      for (const order of customer.orders) {
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await tx.payment.deleteMany({ where: { orderId: order.id } });
        await tx.orderHistory.deleteMany({ where: { orderId: order.id } });
        await tx.refund.deleteMany({ where: { orderId: order.id } });
        await tx.order.delete({ where: { id: order.id } });
      }
      await tx.customer.delete({ where: { id } });
    });

    return { message: 'Đã xóa khách hàng tạm thành công' };
  }
}
