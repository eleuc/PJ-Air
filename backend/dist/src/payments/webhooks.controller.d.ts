import { PaymentsService } from './payments.service';
import { Request } from 'express';
export declare class WebhooksController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    handleStripeWebhook(signature: string, req: Request & {
        rawBody?: Buffer;
    }): Promise<{
        received: boolean;
    }>;
}
