import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { AddressesModule } from './addresses/addresses.module';
import { ZonesModule } from './zones/zones.module';
import { RoutesModule } from './routes/routes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PromotionsModule } from './promotions/promotions.module';
import { DevtoolsModule } from './devtools/devtools.module';
import { AuthModule } from './auth/auth.module';

// Entities
import { Product } from './products/product.entity';
import { User } from './users/user.entity';
import { Profile } from './users/profile.entity';
import { Address } from './addresses/address.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Product, User, Profile, Address, Order, OrderItem],
      synchronize: true,
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    AddressesModule,
    ZonesModule,
    RoutesModule,
    NotificationsModule,
    PromotionsModule,
    DevtoolsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
