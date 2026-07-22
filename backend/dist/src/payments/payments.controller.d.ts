import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getPaymentStats(req: any): Promise<any>;
    createPaymentIntent(dto: CreatePaymentIntentDto): Promise<{
        clientSecret: string;
        isMock?: boolean;
    }>;
    mockConfirmStripePayment(body: {
        orderId: string;
    }): Promise<{
        success: boolean;
    }>;
    capturePayPalPayment(body: {
        orderId: string;
        transactionId: string;
    }): Promise<{
        success: boolean;
    }>;
}
