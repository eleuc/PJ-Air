import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { ProductDiscount } from './product-discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, ProductDiscount])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
