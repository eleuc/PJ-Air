import { Controller, Post, Body, Get, Param, Delete, Patch } from '@nestjs/common';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Body() body: any) {
    const { userId, ...addressData } = body;
    return this.addressesService.create(userId, addressData);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.addressesService.findByUser(userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.addressesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.addressesService.delete(id);
  }
}
