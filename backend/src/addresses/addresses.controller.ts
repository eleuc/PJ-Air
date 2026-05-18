import { Controller, Post, Body, Get, Param, Delete, Patch, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AddressesService } from './addresses.service';
import { CurrentUser } from '../auth/user.decorator';

@Controller('addresses')
@UseGuards(AuthGuard('jwt'))
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@CurrentUser() currentUser: any, @Body() body: any) {
    const { userId, ...addressData } = body;
    return this.addressesService.create(currentUser.id, addressData);
  }

  @Get('user/:userId')
  async findByUser(@CurrentUser() currentUser: any, @Param('userId') userId: string) {
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      throw new NotFoundException('User not found');
    }
    return this.addressesService.findByUser(userId);
  }

  @Patch(':id')
  async update(@CurrentUser() currentUser: any, @Param('id') id: string, @Body() body: any) {
    const userId = currentUser.role === 'admin' ? undefined : currentUser.id;
    return this.addressesService.update(id, body, userId);
  }

  @Delete(':id')
  async delete(@CurrentUser() currentUser: any, @Param('id') id: string) {
    const userId = currentUser.role === 'admin' ? undefined : currentUser.id;
    return this.addressesService.delete(id, userId);
  }
}
