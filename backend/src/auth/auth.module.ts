import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SystemConfig } from '../system-configs/system-config.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([SystemConfig]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
