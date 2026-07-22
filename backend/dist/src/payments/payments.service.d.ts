import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Payment } from './payment.entity';
import { XeroService } from '../xero/xero.service';
export declare class PaymentsService {
    private orderRepository;
    private paymentRepository;
    private readonly xeroService;
    private stripe;
    constructor(orderRepository: Repository<Order>, paymentRepository: Repository<Payment>, xeroService: XeroService);
    createPaymentIntent(orderId: string): Promise<{
        clientSecret: string;
        isMock?: boolean;
    }>;
    mockConfirmStripePayment(orderId: string): Promise<{
        success: boolean;
    }>;
    capturePayPalPayment(orderId: string, transactionId: string): Promise<{
        success: boolean;
    }>;
    handleStripeWebhook(payload: Buffer, sig: string, webhookSecret: string): Promise<void>;
    getPaymentStats(): Promise<any>;
}
