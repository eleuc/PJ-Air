import { Controller, Get, Patch, Post, Param, Body, NotFoundException, UseInterceptors, UploadedFile, BadRequestException, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { CurrentUser } from '../auth/user.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@CurrentUser() currentUser: any, @Param('id') id: string) {
    const targetId = currentUser.role === 'admin' ? id : currentUser.id;
    return this.usersService.findOne(targetId);
  }

  @Patch(':id/profile')
  async updateProfile(@CurrentUser() currentUser: any, @Param('id') id: string, @Body() profileData: any) {
    const targetId = currentUser.role === 'admin' ? id : currentUser.id;
    return this.usersService.updateProfile(targetId, profileData);
  }

  @Patch(':id/role')
  @Roles('admin')
  async updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.updateRole(id, body.role);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // process.cwd() is [root]/backend
          const uploadPath = join(process.cwd(), 'uploads', 'avatars');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(@CurrentUser() currentUser: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const targetId = currentUser.role === 'admin' ? id : currentUser.id;
    console.log('--- Avatar Upload Request ---');
    console.log('User ID:', targetId);
    if (!file) {
      console.error('No file received in request');
      throw new BadRequestException('No file uploaded');
    }
    console.log('File Name:', file.filename);
    console.log('File Path:', file.path);
    
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    try {
      const result = await this.usersService.updateAvatar(targetId, avatarUrl);
      console.log('Profile updated successfully');
      return result;
    } catch (error) {
      console.error('Database update failed:', error.message);
      throw new BadRequestException('Failed to update profile with avatar');
    }
  }

  @Patch(':id/general-discount')
  @Roles('admin')
  async updateGeneralDiscount(@Param('id') id: string, @Body() body: { discount: number }) {
    return this.usersService.updateGeneralDiscount(id, body.discount);
  }

  @Patch(':id/delivery-fee')
  @Roles('admin')
  async updateDeliveryFee(@Param('id') id: string, @Body() body: { fee: number }) {
    return this.usersService.updateDeliveryFee(id, body.fee);
  }

  @Get(':id/product-discounts')
  async getProductDiscounts(@CurrentUser() currentUser: any, @Param('id') id: string) {
    const targetId = currentUser.role === 'admin' ? id : currentUser.id;
    return this.usersService.getProductDiscounts(targetId);
  }

  @Post(':id/product-discounts')
  @Roles('admin')
  async setProductDiscount(@Param('id') id: string, @Body() body: { productId: number; discount_percentage?: number; special_price?: number }) {
    return this.usersService.setProductDiscount(id, body.productId, {
      discount_percentage: body.discount_percentage,
      special_price: body.special_price
    });
  }

  @Delete('product-discounts/:discountId')
  @Roles('admin')
  async deleteProductDiscount(@Param('discountId') discountId: string) {
    return this.usersService.deleteProductDiscount(discountId);
  }
}
