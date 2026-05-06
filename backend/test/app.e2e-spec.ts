import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { join } from 'path';
import * as fs from 'fs';

describe('App Bootstrap & E2E Config (e2e)', () => {
  let app: NestExpressApplication;
  const uploadsPath = join(__dirname, '..', '..', 'uploads');
  const testFileName = 'test-static-asset.txt';
  const testFilePath = join(uploadsPath, testFileName);
  const testFileContent = 'NestJS Static Assets Test Content';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    
    // Replicate bootstrap configuration from main.ts
    app.enableCors();
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads',
    });

    await app.init();

    // Create a temporary static asset to test serving
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    fs.writeFileSync(testFilePath, testFileContent);
  });

  afterAll(async () => {
    // Clean up temporary static asset
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    await app.close();
  });

  describe('Root Health Check', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Bootstrapping Configuration', () => {
    it('should serve static assets correctly from uploads directory via HTTP', async () => {
      const response = await request(app.getHttpServer())
        .get(`/uploads/${testFileName}`)
        .expect(200);

      expect(response.text).toBe(testFileContent);
    });

    it('should configure CORS correctly and support cross-origin preflight requests (OPTIONS)', async () => {
      const response = await request(app.getHttpServer())
        .options('/')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect((res) => {
          // Accept standard CORS preflight success codes (204 No Content is default, 200 is also acceptable)
          if (res.status !== 204 && res.status !== 200) {
            throw new Error(`Expected status 204 or 200, got ${res.status}`);
          }
        });

      // Verify presence of critical CORS preflight response headers
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(
        response.headers['access-control-allow-origin'] === '*' ||
        response.headers['access-control-allow-origin'] === 'http://example.com'
      ).toBe(true);
    });
  });
});

