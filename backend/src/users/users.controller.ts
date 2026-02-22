import { Controller, Get, Patch, Post, Param, Body, NotFoundException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() profileData: any) {
    return this.usersService.updateProfile(id, profileData);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', '..', '..', 'frontend', 'public', 'images', 'avatars');
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
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    console.log('--- Avatar Upload Request ---');
    console.log('User ID:', id);
    if (!file) {
      console.error('No file received in request');
      throw new BadRequestException('No file uploaded');
    }
    console.log('File Name:', file.filename);
    console.log('File Path:', file.path);
    
    const avatarUrl = `/images/avatars/${file.filename}`;
    try {
      const result = await this.usersService.updateAvatar(id, avatarUrl);
      console.log('Profile updated successfully');
      return result;
    } catch (error) {
      console.error('Database update failed:', error.message);
      throw new BadRequestException('Failed to update profile with avatar');
    }
  }
}
