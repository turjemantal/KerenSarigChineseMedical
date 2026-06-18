import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { LoggingThrottlerGuard } from './common/guards/logging-throttler.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MS_PER_MINUTE, MS_PER_HOUR } from './common/constants/time.constants';
import { loggerConfig } from './config/logger.config';
import { LeadsModule } from './leads/leads.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ScheduleBlocksModule } from './schedule-blocks/schedule-blocks.module';
import { WeeklyScheduleModule } from './weekly-schedule/weekly-schedule.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { MessagingModule } from './integrations/messaging/messaging.module';
import { HealthModule } from './health/health.module';
import { config } from './config';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    MongooseModule.forRoot(config.mongodbUri),
    ScheduleModule.forRoot(),
    // Named throttlers: a per-minute and a per-hour window, both keyed by client IP.
    // The global defaults are generous; sensitive routes (e.g. OTP) tighten them
    // via @Throttle. Requires `trust proxy` (see main.ts) to see the real IP.
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'minute', ttl: MS_PER_MINUTE, limit: 60 },
        { name: 'hour', ttl: MS_PER_HOUR, limit: 1000 },
      ],
      // Rate limiting is meaningless in automated test runs (one IP, many rapid
      // calls) and would block the e2e OTP-login flow — skip ONLY in TEST. DEV and
      // PROD keep full per-IP limiting. Mirrors how the SMS provider no-ops in test.
      skipIf: () => config.isTest,
    }),
    MessagingModule,
    HealthModule,
    LeadsModule,
    AppointmentsModule,
    ScheduleBlocksModule,
    WeeklyScheduleModule,
    ClientsModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: LoggingThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
