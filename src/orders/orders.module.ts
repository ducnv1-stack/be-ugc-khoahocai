import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [PrismaModule, AuditModule, CustomersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
