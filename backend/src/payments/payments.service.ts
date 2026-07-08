import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { Payment } from './payment.entity';
import { XeroService } from '../xero/xero.service';
import Stripe from 'stripe';

@Injectable()

export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly xeroService: XeroService,
  ) {

    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_please_change_me_in_env_file';
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-01-27.acacia' as any, // standard API version
    });
  }

  async createPaymentIntent(orderId: string): Promise<{ clientSecret: string; isMock?: boolean }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_please_change_me_in_env_file';
    if (stripeKey.includes('mock_secret_key') || stripeKey === 'sk_test_mock_secret_key_please_change_me_in_env_file') {
      return { clientSecret: 'mock_stripe_client_secret', isMock: true };
    }

    // Stripe expects amount in cents
    const amountInCents = Math.round(Number(order.total) * 100);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'nzd',
        metadata: { orderId },
      });

      // Save a pending payment record
      const payment = this.paymentRepository.create({
        order_id: orderId,
        amount: Number(order.total),
        status: 'pending',
        gateway: 'stripe',
        transaction_id: paymentIntent.id,
      });
      await this.paymentRepository.save(payment);

      return { clientSecret: paymentIntent.client_secret || '', isMock: false };
    } catch (error) {
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  async mockConfirmStripePayment(orderId: string): Promise<{ success: boolean }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.status = 'En Producción';
    order.payment_gateway = 'stripe';
    order.payment_transaction_id = 'mock_stripe_tx_' + Math.random().toString(36).substr(2, 9);
    await this.orderRepository.save(order);

    const payment = this.paymentRepository.create({
      order_id: orderId,
      amount: Number(order.total),
      status: 'completed',
      gateway: 'stripe',
      transaction_id: order.payment_transaction_id,
    });
    await this.paymentRepository.save(payment);

    // Sync to Xero
    this.xeroService.syncOrderToXero(orderId).catch(err => {
      console.error('Failed to sync to Xero:', err);
    });

    return { success: true };
  }


  async capturePayPalPayment(orderId: string, transactionId: string): Promise<{ success: boolean }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Update order status and gateway
    order.status = 'En Producción';
    order.payment_gateway = 'paypal';
    order.payment_transaction_id = transactionId;
    await this.orderRepository.save(order);

    // Save a completed payment record
    const payment = this.paymentRepository.create({
      order_id: orderId,
      amount: Number(order.total),
      status: 'completed',
      gateway: 'paypal',
      transaction_id: transactionId,
    });
    await this.paymentRepository.save(payment);

    // Trigger Xero synchronization asynchronously
    this.xeroService.syncOrderToXero(orderId).catch(err => {
      console.error('Failed to sync to Xero:', err);
    });

    return { success: true };
  }

  async handleStripeWebhook(payload: Buffer, sig: string, webhookSecret: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (order) {
          order.status = 'En Producción';
          order.payment_gateway = 'stripe';
          order.payment_transaction_id = paymentIntent.id;
          await this.orderRepository.save(order);

          // Update Payment status to completed
          const payment = await this.paymentRepository.findOne({ where: { transaction_id: paymentIntent.id } });
          if (payment) {
            payment.status = 'completed';
            await this.paymentRepository.save(payment);
          } else {
            const newPayment = this.paymentRepository.create({
              order_id: orderId,
              amount: Number(order.total),
              status: 'completed',
              gateway: 'stripe',
              transaction_id: paymentIntent.id,
            });
            await this.paymentRepository.save(newPayment);
          }

          // Trigger Xero synchronization asynchronously
          this.xeroService.syncOrderToXero(orderId).catch(err => {
            console.error('Failed to sync to Xero:', err);
          });
        }
      }
    }
  }


}
