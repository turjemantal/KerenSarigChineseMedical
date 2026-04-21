import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { DEFAULT_SOURCE, DEFAULT_APPOINTMENT_TREATMENT } from '../common/constants/defaults.constants';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: DEFAULT_APPOINTMENT_TREATMENT })
  treatment: string;

  @Prop()
  concern: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  time: string; // HH:MM

  @Prop()
  notes: string;

  @Prop({ enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Prop({ default: DEFAULT_SOURCE })
  source: string;

  @Prop({ default: false })
  reminderSent: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
