import { Controller, Post, Body, Get, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('stats')
  @UseGuards(AuthGuard)
  async getPaymentStats(@Req() req: any) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver reportes financieros');
    }
    return this.paymentsService.getPaymentStats();
  }

  @Post('stripe/create-intent')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    if (!dto.orderId) {
      throw new BadRequestException('orderId is required');
    }
    return this.paymentsService.createPaymentIntent(dto.orderId);
  }

  @Post('stripe/mock-confirm')
  async mockConfirmStripePayment(@Body() body: { orderId: string }) {
    if (!body.orderId) {
      throw new BadRequestException('orderId is required');
    }
    return this.paymentsService.mockConfirmStripePayment(body.orderId);
  }

  @Post('paypal/capture')
  async capturePayPalPayment(@Body() body: { orderId: string; transactionId: string }) {
    if (!body.orderId || !body.transactionId) {
      throw new BadRequestException('orderId and transactionId are required');
    }
    return this.paymentsService.capturePayPalPayment(body.orderId, body.transactionId);
  }
}

