import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../src/orders/order.entity';
import { SystemConfig } from '../src/system-configs/system-config.entity';
import { Repository } from 'typeorm';

describe('Xero Integration Circuit (e2e)', () => {
  let app: INestApplication;
  let orderRepo: Repository<Order>;
  let configRepo: Repository<SystemConfig>;

  beforeAll(async () => {
    process.env.XERO_CLIENT_ID = 'mock-client-id';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orderRepo = app.get<Repository<Order>>(getRepositoryToken(Order));
    configRepo = app.get<Repository<SystemConfig>>(getRepositoryToken(SystemConfig));
  });

  afterAll(async () => {
    await app.close();
  });

  let jwtToken: string;
  let currentUserId: string;
  let testOrderId: string;

  it('should successfully register a user for testing', async () => {
    const testUser = {
      email: `xero_test_${Date.now()}@example.com`,
      password: 'Password123!',
      full_name: 'Xero User',
      username: `xerouser_${Date.now()}`
    };

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(testUser)
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201);

    jwtToken = loginRes.body.session.access_token;
    currentUserId = loginRes.body.user.id;
  });

  it('should simulate Xero OAuth callback and set mock credentials', async () => {
    await request(app.getHttpServer())
      .get('/xero/callback?code=mock_code_123')
      .expect(302);
      
    const accessToken = await configRepo.findOne({ where: { key: 'xero_access_token' } });
    expect(accessToken.value).toBe('mock_access_token');
  });

  it('should create an order eligible for Xero sync (paid / En Producción)', async () => {
    const order = orderRepo.create({
      user_id: currentUserId,
      total: 250,
      status: 'En Producción',
      payment_status: 'paid',
      payment_gateway: 'Transferencia Bancaria',
      payment_transaction_id: 'TRX_12345'
    });
    const saved = await orderRepo.save(order);
    testOrderId = saved.id;
    expect(testOrderId).toBeDefined();
  });

  it('should sync pending paid orders in batch', async () => {
    const res = await request(app.getHttpServer())
      .post('/xero/sync-batch')
      .expect(201);
      
    expect(res.body.successCount).toBeGreaterThanOrEqual(1);
    
    // Verify that the order has been updated with xero_invoice_id
    const updatedOrder = await orderRepo.findOne({ where: { id: testOrderId } });
    expect(updatedOrder.xero_invoice_id).toBeDefined();
    expect(updatedOrder.xero_invoice_id).toContain('xero_inv_');
  });
});
