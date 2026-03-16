import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { ProductDiscount } from './product-discount.entity';
import { ImageProcessingService } from '../common/services/image-processing.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, ProductDiscount])],
  controllers: [UsersController],
  providers: [UsersService, ImageProcessingService],
  exports: [UsersService, ImageProcessingService],
})
export class UsersModule {}
