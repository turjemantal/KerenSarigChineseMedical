import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsManager } from './appointments.manager';
import { AppointmentsService } from './appointments.service';
import { AppointmentsDao } from './appointments.dao';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsManager, AppointmentsService, AppointmentsDao],
})
export class AppointmentsModule {}
