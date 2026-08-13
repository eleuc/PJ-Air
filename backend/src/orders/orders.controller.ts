import { Controller, Post, Get, Body, Param, Patch, Query, Res, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ExcelService } from './excel.service';
import { AuthGuard } from '../auth/auth.guard';

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
    const buffer = await this.excelService.exportIndividual(orders);
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
    const buffer = await this.excelService.exportConsolidated(orders);
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
    @Query('filterBy') filterBy?: 'created_at' | 'delivery_date',
  ) {
    return this.ordersService.findInRange(startDate, endDate, userId, filterBy);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const userRole = req.user?.role;
    return this.ordersService.updateStatus(id, status, userRole);
  }

  @Patch(':id/assign')
  async assignDelivery(@Param('id') id: string, @Body('deliveryUserId') deliveryUserId: string) {
    return this.ordersService.assignDelivery(id, deliveryUserId);
  }

  @Patch(':id/payment')
  @UseGuards(AuthGuard)
  async updatePaymentInfo(
    @Param('id') id: string,
    @Body() body: { payment_status?: string; payment_gateway?: string; payment_transaction_id?: string }
  ) {
    return this.ordersService.updatePaymentInfo(id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userRole = req.user?.role;
    return this.ordersService.update(id, body, userRole);
  }
}
