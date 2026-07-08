import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Order } from '../orders/order.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { XeroModule } from '../xero/xero.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]), XeroModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService],
  exports: [TypeOrmModule, PaymentsService],
})
export class PaymentsModule {}
