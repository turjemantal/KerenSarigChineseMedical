import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

// Load .env from project root for local dev. In Docker, vars come from
// docker-compose environment: section so this is a silent no-op.
loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
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
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: config.clientUrl });
  app.setGlobalPrefix('api');
  await app.listen(config.port, '0.0.0.0');
}
void bootstrap();
