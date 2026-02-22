import { Module } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { DevtoolsController } from './devtools.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [DevtoolsService],
  controllers: [DevtoolsController]
})
export class DevtoolsModule {}
