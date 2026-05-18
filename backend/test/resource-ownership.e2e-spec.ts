import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Resource Ownership Security (e2e)', () => {
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
  let user2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 1. Register and login User 1
    const user1Data = {
      email: `user1_${Date.now()}@test.com`,
      password: 'User1Password123!',
      full_name: 'User One',
      username: `user1_${Date.now()}`,
    };
    await request(app.getHttpServer()).post('/auth/signup').send(user1Data).expect(201);
    const user1Login = await request(app.getHttpServer()).post('/auth/login').send({ email: user1Data.email, password: user1Data.password }).expect(201);
    user1Token = user1Login.body.session.access_token;

    // 2. Register and login User 2
    const user2Data = {
      email: `user2_${Date.now()}@test.com`,
      password: 'User2Password123!',
      full_name: 'User Two',
      username: `user2_${Date.now()}`,
    };
    await request(app.getHttpServer()).post('/auth/signup').send(user2Data).expect(201);
    const user2Login = await request(app.getHttpServer()).post('/auth/login').send({ email: user2Data.email, password: user2Data.password }).expect(201);
    user2Token = user2Login.body.session.access_token;
    user2Id = user2Login.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 404 when a user tries to fetch another user\'s addresses', async () => {
    // Attempting to fetch user 2's addresses using user 1's token
    const response = await request(app.getHttpServer())
      .get(`/addresses/user/${user2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);
      
    expect(response.status).toBe(404);
  });

  it('should return 404 when a user tries to view another user\'s specific order details', async () => {
    // Attempting to fetch order 999 (owned by user 2) using user 1's token
    const response = await request(app.getHttpServer())
      .get('/orders/999')
      .set('Authorization', `Bearer ${user1Token}`);
      
    expect(response.status).toBe(404);
  });
});
