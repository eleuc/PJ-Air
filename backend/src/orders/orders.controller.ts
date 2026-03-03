import { Controller, Post, Get, Body, Param, Patch, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() body: any) {
    const { userId, ...orderData } = body;
    return this.ordersService.create(userId, orderData);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get('reports/range')
  async findInRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
  ) {
    return this.ordersService.findInRange(startDate, endDate, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/assign')
  async assignDelivery(@Param('id') id: string, @Body('deliveryUserId') deliveryUserId: string) {
    return this.ordersService.assignDelivery(id, deliveryUserId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ordersService.update(id, body);
  }
}
