import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/order.entity';
import { SystemConfig } from '../system-configs/system-config.entity';

@Injectable()
export class XeroService {
  private readonly logger = new Logger(XeroService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  private async getConfig(key: string): Promise<string | null> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config ? config.value : null;
  }

  private async setConfig(key: string, value: string): Promise<void> {
    let config = await this.configRepository.findOne({ where: { key } });
    if (config) {
      config.value = value;
    } else {
      config = this.configRepository.create({ key, value });
    }
    await this.configRepository.save(config);
  }

  async getXeroAuthUrl(): Promise<string> {
    const clientId = process.env.XERO_CLIENT_ID || 'mock-client-id';
    const redirectUri = `${process.env.FRONTEND_URL || 'https://testing.jhoanes.com'}/api/xero/callback`;
    const scope = encodeURIComponent('openid profile email accounting.transactions accounting.settings offline_access');
    
    return `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=pjair`;
  }

  async handleCallback(code: string): Promise<any> {
    const clientId = process.env.XERO_CLIENT_ID || 'mock-client-id';
    const clientSecret = process.env.XERO_CLIENT_SECRET || 'mock-client-secret';
    const redirectUri = `${process.env.FRONTEND_URL || 'https://testing.jhoanes.com'}/api/xero/callback`;

    this.logger.log(`Exchanging code for tokens with Xero...`);
    
    // In mock/sandbox mode if credentials are mock
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

      // Get Tenant ID
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
    } catch (error) {
      this.logger.error(`Error connecting to Xero: ${error.message}`);
      throw new BadRequestException(`Xero Integration Error: ${error.message}`);
    }
  }

  async getAccessToken(): Promise<string | null> {
    const refreshToken = await this.getConfig('xero_refresh_token');
    if (!refreshToken) return null;

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
    } catch (error) {
      this.logger.error(`Failed to refresh Xero token: ${error.message}`);
      return null;
    }
  }

  async syncOrderToXero(orderId: string): Promise<{ success: boolean; invoiceId?: string }> {
    const order = await this.orderRepository.findOne({ 
      where: { id: orderId },
      relations: ['items', 'items.product', 'user', 'user.profile'] 
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const accessToken = await this.getAccessToken();
    const tenantId = await this.getConfig('xero_tenant_id');

    if (!accessToken || !tenantId) {
      this.logger.warn(`Xero integration is not authorized yet. Skipping sync for order ${orderId}.`);
      return { success: false };
    }

    // If mock, return simulated success
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
        AccountCode: '200', // default sales account
      }));

      // Create Invoice
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

      // Update Order with Xero Invoice ID
      order.xero_invoice_id = invoiceId;
      await this.orderRepository.save(order);

      // Post Payment to Invoice if order is paid
      if (order.status === 'confirmed' && order.payment_transaction_id) {
        const paymentPayload = {
          Payments: [{
            Invoice: { InvoiceID: invoiceId },
            Account: { Code: '090' }, // default business bank account
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
    } catch (error) {
      this.logger.error(`Error syncing order ${orderId} to Xero: ${error.message}`);
      return { success: false };
    }
  }
}
