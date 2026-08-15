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
var XeroService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XeroService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/order.entity");
const system_config_entity_1 = require("../system-configs/system-config.entity");
let XeroService = XeroService_1 = class XeroService {
    orderRepository;
    configRepository;
    logger = new common_1.Logger(XeroService_1.name);
    constructor(orderRepository, configRepository) {
        this.orderRepository = orderRepository;
        this.configRepository = configRepository;
    }
    async getConfig(key) {
        const config = await this.configRepository.findOne({ where: { key } });
        return config ? config.value : null;
    }
    async setConfig(key, value) {
        let config = await this.configRepository.findOne({ where: { key } });
        if (config) {
            config.value = value;
        }
        else {
            config = this.configRepository.create({ key, value });
        }
        await this.configRepository.save(config);
    }
    async getXeroAuthUrl() {
        const clientId = process.env.XERO_CLIENT_ID || 'mock-client-id';
        const redirectUri = `${process.env.FRONTEND_URL || 'https://testing.jhoanes.com'}/api/xero/callback`;
        const scope = encodeURIComponent('openid profile email accounting.transactions accounting.settings offline_access');
        return `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=pjair`;
    }
    async handleCallback(code) {
        const clientId = process.env.XERO_CLIENT_ID || 'mock-client-id';
        const clientSecret = process.env.XERO_CLIENT_SECRET || 'mock-client-secret';
        const redirectUri = `${process.env.FRONTEND_URL || 'https://testing.jhoanes.com'}/api/xero/callback`;
        this.logger.log(`Exchanging code for tokens with Xero...`);
        if (clientId === 'mock-client-id') {
            await this.setConfig('xero_access_token', 'mock_access_token');
            await this.setConfig('xero_refresh_token', 'mock_refresh_token');
            await this.setConfig('xero_tenant_id', 'mock_tenant_id');
            return { success: true, message: 'Mock Xero connection established successfully' };
        }
        try {
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const response = await fetch('https://identity.xero.com/connect/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: redirectUri,
                }).toString(),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Token exchange failed: ${errText}`);
            }
            const data = await response.json();
            await this.setConfig('xero_access_token', data.access_token);
            await this.setConfig('xero_refresh_token', data.refresh_token);
            const connectionsRes = await fetch('https://api.xero.com/connections', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (connectionsRes.ok) {
                const connections = await connectionsRes.json();
                if (connections && connections.length > 0) {
                    await this.setConfig('xero_tenant_id', connections[0].tenantId);
                }
            }
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Error connecting to Xero: ${error.message}`);
            throw new common_1.BadRequestException(`Xero Integration Error: ${error.message}`);
        }
    }
    async getAccessToken() {
        const refreshToken = await this.getConfig('xero_refresh_token');
        if (!refreshToken)
            return null;
        const clientId = process.env.XERO_CLIENT_ID || 'mock-client-id';
        const clientSecret = process.env.XERO_CLIENT_SECRET || 'mock-client-secret';
        if (clientId === 'mock-client-id') {
            return 'mock_access_token';
        }
        try {
            const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
            const response = await fetch('https://identity.xero.com/connect/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                }).toString(),
            });
            if (!response.ok) {
                throw new Error('Failed to refresh Xero token');
            }
            const data = await response.json();
            await this.setConfig('xero_access_token', data.access_token);
            await this.setConfig('xero_refresh_token', data.refresh_token);
            return data.access_token;
        }
        catch (error) {
            this.logger.error(`Failed to refresh Xero token: ${error.message}`);
            return null;
        }
    }
    async syncOrderToXero(orderId) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['items', 'items.product', 'user', 'user.profile']
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        const accessToken = await this.getAccessToken();
        const tenantId = await this.getConfig('xero_tenant_id');
        if (!accessToken || !tenantId) {
            this.logger.warn(`Xero integration is not authorized yet. Skipping sync for order ${orderId}.`);
            return { success: false };
        }
        if (accessToken === 'mock_access_token') {
            const mockInvoiceId = `xero_inv_${Math.random().toString(36).substring(7)}`;
            order.xero_invoice_id = mockInvoiceId;
            await this.orderRepository.save(order);
            this.logger.log(`[MOCK XERO] Order ${orderId} synced to Xero as Invoice ${mockInvoiceId}`);
            return { success: true, invoiceId: mockInvoiceId };
        }
        try {
            const lineItems = (order.items || []).map(item => ({
                Description: item.product?.name || 'Producto PJ-Air',
                Quantity: item.quantity,
                UnitAmount: Number(item.price_at_time),
                AccountCode: '200',
            }));
            const invoicePayload = {
                Invoices: [{
                        Type: 'ACCREC',
                        Contact: {
                            Name: order.user?.profile?.full_name || order.user?.email || 'Cliente PJ-Air',
                            EmailAddress: order.user?.email,
                        },
                        LineItems: lineItems,
                        Date: new Date().toISOString().split('T')[0],
                        DueDate: order.payment_due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        Status: 'AUTHORISED',
                    }],
            };
            const response = await fetch('https://api.xero.com/api.xro/2.0/Invoices', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Xero-tenant-id': tenantId,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(invoicePayload),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Xero invoice creation failed: ${errText}`);
            }
            const resData = await response.json();
            const invoice = resData.Invoices?.[0];
            const invoiceId = invoice?.InvoiceID;
            if (!invoiceId) {
                throw new Error('Invoice ID not returned by Xero');
            }
            order.xero_invoice_id = invoiceId;
            await this.orderRepository.save(order);
            if (order.status === 'En Producción' && order.payment_transaction_id) {
                const paymentPayload = {
                    Payments: [{
                            Invoice: { InvoiceID: invoiceId },
                            Account: { Code: '090' },
                            Amount: Number(order.total),
                            Date: new Date().toISOString().split('T')[0],
                            Reference: `Payment for Order ${order.id} via ${order.payment_gateway || 'Gateway'}`,
                        }],
                };
                const paymentRes = await fetch('https://api.xero.com/api.xro/2.0/Payments', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Xero-tenant-id': tenantId,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(paymentPayload),
                });
                if (!paymentRes.ok) {
                    const payErrText = await paymentRes.text();
                    this.logger.error(`Failed to post payment to Xero: ${payErrText}`);
                }
            }
            return { success: true, invoiceId };
        }
        catch (error) {
            this.logger.error(`Error syncing order ${orderId} to Xero: ${error.message}`);
            return { success: false };
        }
    }
    async syncPendingPaidOrders() {
        this.logger.log('Running batch Xero synchronization for unsynced orders...');
        const unsyncedOrders = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('order.xero_invoice_id IS NULL')
            .andWhere('(order.payment_status = :paid OR order.status = :inProd)', {
            paid: 'paid',
            inProd: 'En Producción',
        })
            .getMany();
        let successCount = 0;
        for (const order of unsyncedOrders) {
            const res = await this.syncOrderToXero(order.id);
            if (res.success)
                successCount++;
        }
        this.logger.log(`Batch Xero sync completed: ${successCount}/${unsyncedOrders.length} orders synced.`);
        return { processed: unsyncedOrders.length, successCount };
    }
};
exports.XeroService = XeroService;
exports.XeroService = XeroService = XeroService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], XeroService);
//# sourceMappingURL=xero.service.js.map