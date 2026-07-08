import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/order.entity';
import { SystemConfig } from '../system-configs/system-config.entity';
import { XeroService } from './xero.service';
import { XeroController } from './xero.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, SystemConfig])],
  controllers: [XeroController],
  providers: [XeroService],
  exports: [XeroService],
})
export class XeroModule {}
