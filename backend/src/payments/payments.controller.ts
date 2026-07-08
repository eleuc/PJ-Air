import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe/create-intent')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    if (!dto.orderId) {
      throw new BadRequestException('orderId is required');
    }
    return this.paymentsService.createPaymentIntent(dto.orderId);
  }

  @Post('paypal/capture')
  async capturePayPalPayment(@Body() body: { orderId: string; transactionId: string }) {
    if (!body.orderId || !body.transactionId) {
      throw new BadRequestException('orderId and transactionId are required');
    }
    return this.paymentsService.capturePayPalPayment(body.orderId, body.transactionId);
  }
}
