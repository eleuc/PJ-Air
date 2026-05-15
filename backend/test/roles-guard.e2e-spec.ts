import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Role-Based Access Guard (e2e)', () => {
  let app: INestApplication;
  let standardUserToken: string;

  const standardUser = {
    email: `std_user_${Date.now()}@example.com`,
    password: 'Password123!',
    full_name: 'Standard User',
    username: `stduser_${Date.now()}`
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 1. Signup a standard user
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(standardUser)
      .expect(201);

    // 2. Login to get a valid token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: standardUser.email,
        password: standardUser.password
      })
      .expect(201);

    standardUserToken = loginRes.body.session.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 403 Forbidden when a standard user attempts to access admin product endpoints', async () => {
    const response = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Standard User Product',
        name_en: 'Standard User Product EN',
        price: 99.99,
        category: 'e2e-category',
        stock: 50
      })
      .set('Authorization', `Bearer ${standardUserToken}`);
      
    expect(response.status).toBe(403);
  });

  it('should return 403 Forbidden when a standard user attempts to access admin user management endpoints', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/some-uuid/role')
      .send({ role: 'admin' })
      .set('Authorization', `Bearer ${standardUserToken}`);
      
    expect(response.status).toBe(403);
  });
});
