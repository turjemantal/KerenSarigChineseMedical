import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadsModule } from './leads/leads.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './integrations/whatsapp/whatsapp.module';
import { MONGODB_URI_FALLBACK } from './common/constants/db.constants';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || MONGODB_URI_FALLBACK),
    ScheduleModule.forRoot(),
    WhatsappModule,
    LeadsModule,
    AppointmentsModule,
    ClientsModule,
    AuthModule,
  ],
})
export class AppModule {}
