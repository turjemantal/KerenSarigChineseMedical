import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsManager } from './appointments.manager';
import { AppointmentsService } from './appointments.service';
import { AppointmentsDao } from './appointments.dao';
import { ScheduleBlocksModule } from '../schedule-blocks/schedule-blocks.module';
import { WeeklyScheduleModule } from '../weekly-schedule/weekly-schedule.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    ScheduleBlocksModule,
    WeeklyScheduleModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsManager, AppointmentsService, AppointmentsDao],
})
export class AppointmentsModule {}
