import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3001);
  console.log(`Server running on port ${process.env.PORT || 3001}`);
}
bootstrap();
