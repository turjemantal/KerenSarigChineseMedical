import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { LoggingThrottlerGuard } from './common/guards/logging-throttler.guard';
import { loggerConfig } from './config/logger.config';
import { LeadsModule } from './leads/leads.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ScheduleBlocksModule } from './schedule-blocks/schedule-blocks.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { MessagingModule } from './integrations/messaging/messaging.module';
import { config } from './config';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    MongooseModule.forRoot(config.mongodbUri),
    ScheduleModule.forRoot(),
    // Named throttlers: a per-minute and a per-hour window, both keyed by client IP.
    // The global defaults are generous; sensitive routes (e.g. OTP) tighten them
    // via @Throttle. Requires `trust proxy` (see main.ts) to see the real IP.
    ThrottlerModule.forRoot([
      { name: 'minute', ttl: 60_000, limit: 60 },
      { name: 'hour', ttl: 3_600_000, limit: 1000 },
    ]),
    MessagingModule,
    LeadsModule,
    AppointmentsModule,
    ScheduleBlocksModule,
    ClientsModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: LoggingThrottlerGuard }],
})
export class AppModule {}
