import { Controller, Post, Get, Body, Param, Patch, Query, Res } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ExcelService } from './excel.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly excelService: ExcelService,
  ) {}

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

  @Get('reports/export-individual')
  async exportIndividual(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: any,
  ) {
    const orders = await this.ordersService.findInRange(startDate, endDate);
    const buffer = this.excelService.exportIndividual(orders);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ORDENES_INDIVIDUALES.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('reports/export-consolidated')
  async exportConsolidated(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: any,
  ) {
    const orders = await this.ordersService.findInRange(startDate, endDate);
    const buffer = this.excelService.exportConsolidated(orders);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ORDENES_CONSOLIDADO.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
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
