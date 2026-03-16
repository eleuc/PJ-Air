import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './product.entity';
import { ImageProcessingService } from '../common/services/image-processing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ImageProcessingService],
  controllers: [ProductsController],
  exports: [ProductsService, ImageProcessingService],
})
export class ProductsModule {}
