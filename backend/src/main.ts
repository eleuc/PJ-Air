import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // Enable CORS for development
  
  const uploadsPath = resolve(process.env.UPLOAD_PATH || 'uploads');
  console.log('UPLOADS PATH RESOLVED TO:', uploadsPath);
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
