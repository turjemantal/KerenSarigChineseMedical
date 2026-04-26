import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: config.clientUrl });
  app.setGlobalPrefix('api');
  await app.listen(config.port);
  console.log(`Server running on port ${config.port}`);
}
bootstrap();
