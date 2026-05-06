import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Resource Ownership Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.skip('should return 403 when a user tries to fetch or modify another user\'s addresses', async () => {
    // Attempting to fetch user 2's addresses using user 1's token
    const response = await request(app.getHttpServer())
      .get('/addresses/user/2')
      .set('Authorization', 'Bearer user1-token');
      
    expect([403]).toContain(response.status);
  });

  it.skip('should return 403 when a user tries to view another user\'s specific order details', async () => {
    // Attempting to fetch order 999 (owned by user 2) using user 1's token
    const response = await request(app.getHttpServer())
      .get('/orders/999')
      .set('Authorization', 'Bearer user1-token');
      
    expect([403]).toContain(response.status);
  });
});
