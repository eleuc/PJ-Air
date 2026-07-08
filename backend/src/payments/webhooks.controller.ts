import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments/webhook')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    if (!signature) {
      throw new BadRequestException('stripe-signature header is missing');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('rawBody is missing from request');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_webhook_secret_please_change_me_in_env_file';
    await this.paymentsService.handleStripeWebhook(rawBody, signature, webhookSecret);

    return { received: true };
  }
}
