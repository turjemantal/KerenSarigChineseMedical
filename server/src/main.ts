import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

// Load .env from project root for local dev. In Docker, vars come from
// docker-compose environment: section so this is a silent no-op.
loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { config } from './config';
import { envSchema } from './config/env.validation';
import { LOCAL_DB_HOSTS, MONGODB_SRV_PREFIX, MONGODB_PREFIX } from './common/constants/database.constants';

const { error } = envSchema.validate(process.env);
if (error) {
  console.error(`[Config] Missing or invalid environment variables:\n  ${error.message}`);
  process.exit(1);
}

// Hard stop against polluting the real (Atlas) DB from a non-PROD run: if we're
// not PROD and MONGODB_URI points at a non-local host, refuse to start. This is
// the safety net that keeps local/dev/test work from ever writing to production
// data.
function dbHostIsLocal(uri: string): boolean {
  if (uri.startsWith(MONGODB_SRV_PREFIX)) return false; // SRV = a hosted cluster
  let host = '';
  try {
    host = new URL(uri).hostname;
  } catch {
    host = uri.replace(MONGODB_PREFIX, '').replace(/.*@/, '').split(/[:/?,]/)[0];
  }
  return (LOCAL_DB_HOSTS as readonly string[]).includes(host);
}
if (!config.isProd && !dbHostIsLocal(config.mongodbUri)) {
  console.error(
    `[Safety] APP_ENV=${process.env.APP_ENV ?? 'unset'} but MONGODB_URI points at a remote host. ` +
      `Refusing to start so non-PROD work can't write to production data. Use a local database.`,
  );
  process.exit(1);
}

async function bootstrap() {
  // bufferLogs so early startup logs also go through the structured pino logger
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  // Behind nginx: trust exactly one proxy hop so req.ip is the real client IP
  // (read from X-Forwarded-For, which nginx overwrites with the true remote_addr).
  // Without this, per-IP rate limiting sees only nginx's IP and is useless.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: config.clientUrl });
  app.setGlobalPrefix('api');
  await app.listen(config.port, '0.0.0.0');
}
void bootstrap();
