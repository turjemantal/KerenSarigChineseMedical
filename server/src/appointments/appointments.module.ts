import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentsController } from './appointments.controller';
import { CalendarRedirectController } from './calendar-redirect.controller';
import { AppointmentsManager } from './appointments.manager';
import { AppointmentsService } from './appointments.service';
import { AppointmentsDao } from './appointments.dao';
import { ScheduleBlocksModule } from '../schedule-blocks/schedule-blocks.module';
import { WeeklyScheduleModule } from '../weekly-schedule/weekly-schedule.module';
import { ClinicSettingsModule } from '../clinic-settings/clinic-settings.module';
import { ClientsModule } from '../clients/clients.module';
import { GoogleCalendarModule } from '../integrations/google-calendar/google-calendar.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    ScheduleBlocksModule,
    WeeklyScheduleModule,
    ClinicSettingsModule,
    ClientsModule,
    GoogleCalendarModule,
  ],
  controllers: [AppointmentsController, CalendarRedirectController],
  providers: [AppointmentsManager, AppointmentsService, AppointmentsDao],
})
export class AppointmentsModule {}
