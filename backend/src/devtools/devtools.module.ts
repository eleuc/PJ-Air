import { Module } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { DevtoolsController } from './devtools.controller';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ProductsModule, UsersModule],
  providers: [DevtoolsService],
  controllers: [DevtoolsController]
})
export class DevtoolsModule {}
