import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log("Testing login for user1...");
  try {
    const result = await authService.login('user1', '123132');
    console.log("Login Success!", JSON.stringify(result.user, null, 2));
  } catch (e) {
    console.log("Login Failed:", e.message);
  }

  await app.close();
}

bootstrap();
