import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadsModule } from './leads/leads.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './integrations/whatsapp/whatsapp.module';
import { config } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongodbUri),
    ScheduleModule.forRoot(),
    WhatsappModule,
    LeadsModule,
    AppointmentsModule,
    ClientsModule,
    AuthModule,
  ],
})
export class AppModule {}
