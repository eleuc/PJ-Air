"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/order.entity");
const payment_entity_1 = require("./payment.entity");
const xero_service_1 = require("../xero/xero.service");
const stripe_1 = __importDefault(require("stripe"));
let PaymentsService = class PaymentsService {
    orderRepository;
    paymentRepository;
    xeroService;
    stripe;
    constructor(orderRepository, paymentRepository, xeroService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.xeroService = xeroService;
        const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_please_change_me_in_env_file';
        this.stripe = new stripe_1.default(stripeKey, {
            apiVersion: '2025-01-27.acacia',
        });
    }
    async createPaymentIntent(orderId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_secret_key_please_change_me_in_env_file';
        if (stripeKey.includes('mock_secret_key') || stripeKey === 'sk_test_mock_secret_key_please_change_me_in_env_file') {
            return { clientSecret: 'mock_stripe_client_secret', isMock: true };
        }
        const amountInCents = Math.round(Number(order.total) * 100);
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'nzd',
                metadata: { orderId },
            });
            const payment = this.paymentRepository.create({
                order_id: orderId,
                amount: Number(order.total),
                status: 'pending',
                gateway: 'stripe',
                transaction_id: paymentIntent.id,
            });
            await this.paymentRepository.save(payment);
            return { clientSecret: paymentIntent.client_secret || '', isMock: false };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Stripe error: ${error.message}`);
        }
    }
    async mockConfirmStripePayment(orderId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        order.status = 'En Producción';
        order.payment_gateway = 'stripe';
        order.payment_transaction_id = 'mock_stripe_tx_' + Math.random().toString(36).substr(2, 9);
        order.payment_status = 'paid';
        await this.orderRepository.save(order);
        const payment = this.paymentRepository.create({
            order_id: orderId,
            amount: Number(order.total),
            status: 'completed',
            gateway: 'stripe',
            transaction_id: order.payment_transaction_id,
        });
        await this.paymentRepository.save(payment);
        this.xeroService.syncOrderToXero(orderId).catch(err => {
            console.error('Failed to sync to Xero:', err);
        });
        return { success: true };
    }
    async capturePayPalPayment(orderId, transactionId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${orderId} not found`);
        }
        order.status = 'En Producción';
        order.payment_gateway = 'paypal';
        order.payment_transaction_id = transactionId;
        order.payment_status = 'paid';
        await this.orderRepository.save(order);
        const payment = this.paymentRepository.create({
            order_id: orderId,
            amount: Number(order.total),
            status: 'completed',
            gateway: 'paypal',
            transaction_id: transactionId,
        });
        await this.paymentRepository.save(payment);
        this.xeroService.syncOrderToXero(orderId).catch(err => {
            console.error('Failed to sync to Xero:', err);
        });
        return { success: true };
    }
    async handleStripeWebhook(payload, sig, webhookSecret) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata?.orderId;
            if (orderId) {
                const order = await this.orderRepository.findOne({ where: { id: orderId } });
                if (order) {
                    order.status = 'En Producción';
                    order.payment_gateway = 'stripe';
                    order.payment_transaction_id = paymentIntent.id;
                    order.payment_status = 'paid';
                    await this.orderRepository.save(order);
                    const payment = await this.paymentRepository.findOne({ where: { transaction_id: paymentIntent.id } });
                    if (payment) {
                        payment.status = 'completed';
                        await this.paymentRepository.save(payment);
                    }
                    else {
                        const newPayment = this.paymentRepository.create({
                            order_id: orderId,
                            amount: Number(order.total),
                            status: 'completed',
                            gateway: 'stripe',
                            transaction_id: paymentIntent.id,
                        });
                        await this.paymentRepository.save(newPayment);
                    }
                    this.xeroService.syncOrderToXero(orderId).catch(err => {
                        console.error('Failed to sync to Xero:', err);
                    });
                }
            }
        }
    }
    async getPaymentStats() {
        const orders = await this.orderRepository.find();
        const payments = await this.paymentRepository.find();
        let totalRevenue = 0;
        let stripeRevenue = 0;
        let paypalRevenue = 0;
        const statusCounts = {
            unpaid: 0,
            pending: 0,
            paid: 0,
            failed: 0,
            refunded: 0,
        };
        let xeroSyncedCount = 0;
        let xeroPendingCount = 0;
        for (const order of orders) {
            const status = order.payment_status || 'unpaid';
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            }
            else {
                statusCounts[status] = 1;
            }
            if (status === 'paid') {
                const amount = Number(order.total || 0);
                totalRevenue += amount;
                if (order.payment_gateway === 'stripe') {
                    stripeRevenue += amount;
                }
                else if (order.payment_gateway === 'paypal') {
                    paypalRevenue += amount;
                }
                if (order.xero_invoice_id) {
                    xeroSyncedCount++;
                }
                else {
                    xeroPendingCount++;
                }
            }
        }
        const gatewayBreakdown = {
            stripe: stripeRevenue,
            paypal: paypalRevenue,
        };
        const paymentRecords = payments.map(p => ({
            id: p.id,
            order_id: p.order_id,
            amount: Number(p.amount),
            status: p.status,
            gateway: p.gateway,
            transaction_id: p.transaction_id,
            created_at: p.created_at,
        }));
        return {
            totalRevenue,
            gatewayBreakdown,
            statusCounts,
            xeroSync: {
                synced: xeroSyncedCount,
                pending: xeroPendingCount,
            },
            recentPayments: paymentRecords.slice(-10).reverse(),
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        xero_service_1.XeroService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map