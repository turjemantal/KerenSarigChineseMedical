import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';
import { envSchema } from './config/env.validation';

const { error } = envSchema.validate(process.env);
if (error) {
  console.error(`[Config] Missing or invalid environment variables:\n  ${error.message}`);
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: config.clientUrl });
  app.setGlobalPrefix('api');
  await app.listen(config.port, '0.0.0.0');
}
void bootstrap();
