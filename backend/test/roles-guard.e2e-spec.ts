import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Role-Based Access Guard (e2e)', () => {
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

  it.skip('should return 403 Forbidden when a standard user attempts to access admin product endpoints', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Standard User Product',
        name_en: 'Standard User Product EN',
        price: 99.99,
        category: 'e2e-category',
        stock: 50
      })
      .set('Authorization', 'Bearer standard-user-token');
      
    // Expect 403 if roles guard is implemented correctly
    expect([403]).toContain(response.status);
  });

  it.skip('should return 403 Forbidden when a standard user attempts to access admin user management endpoints', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/1/role')
      .send({ role: 'admin' })
      .set('Authorization', 'Bearer standard-user-token');
      
    // Expect 403 if roles guard is implemented correctly
    expect([403]).toContain(response.status);
  });
});
