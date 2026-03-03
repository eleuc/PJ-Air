import { Module } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { DevtoolsController } from './devtools.controller';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [ProductsModule, UsersModule, OrdersModule, AddressesModule],
  providers: [DevtoolsService],
  controllers: [DevtoolsController]
})
export class DevtoolsModule {}
