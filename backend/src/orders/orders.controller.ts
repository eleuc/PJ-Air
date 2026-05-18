import { Controller, Post, Get, Body, Param, Patch, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../auth/user.decorator';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@CurrentUser() currentUser: any, @Body() body: any) {
    const { userId, ...orderData } = body;
    return this.ordersService.create(currentUser.id, orderData);
  }

  @Get()
  @Roles('admin')
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@CurrentUser() currentUser: any, @Param('userId') userId: string) {
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      throw new NotFoundException('User not found');
    }
    return this.ordersService.findByUser(userId);
  }

  @Get('reports/range')
  @Roles('admin')
  async findInRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
  ) {
    return this.ordersService.findInRange(startDate, endDate, userId);
  }

  @Get(':id')
  async findOne(@CurrentUser() currentUser: any, @Param('id') id: string) {
    const userId = currentUser.role === 'admin' ? undefined : currentUser.id;
    return this.ordersService.findOne(id, userId);
  }

  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/assign')
  @Roles('admin')
  async assignDelivery(@Param('id') id: string, @Body('deliveryUserId') deliveryUserId: string) {
    return this.ordersService.assignDelivery(id, deliveryUserId);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.update(id, body);
  }
}
