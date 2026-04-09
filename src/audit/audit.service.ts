import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(params: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: any;
    newData?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: params.oldData ? JSON.parse(JSON.stringify(params.oldData)) : null,
        newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : null,
      }
    });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      take: 200
    });
  }
}
