import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { HealthStatus, MONGOOSE_READY_STATES, DB_STATE_CONNECTED, DB_STATE_UNKNOWN } from './health.constants';

// Public, read-only liveness/readiness probe. This is the ONLY sanctioned way to
// verify production after a deploy — it creates and mutates nothing. See the
// "Verifying production safely" doctrine in CLAUDE.md / docs.
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    const db = MONGOOSE_READY_STATES[this.connection.readyState] ?? DB_STATE_UNKNOWN;
    return {
      status: db === DB_STATE_CONNECTED ? HealthStatus.Ok : HealthStatus.Degraded,
      db,
      env: process.env.APP_ENV ?? 'unset',
      time: new Date().toISOString(),
    };
  }
}
