import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AppointmentStatus, ACTIVE_APPOINTMENT_STATUSES } from '../common/enums/appointment-status.enum';
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

  @Prop({ type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Prop({ default: DEFAULT_SOURCE })
  source: string;

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop()
  googleCalendarEventId: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Hard guarantee against double-booking: at most one ACTIVE (pending/scheduled)
// appointment may exist per date+time slot. Enforced atomically by Mongo, so even two
// simultaneous booking requests for the same slot can't both succeed (the loser hits a
// duplicate-key error, which the manager translates to "slot not available"). The
// partial filter scopes uniqueness to active appointments only, so a cancelled/rejected
// slot is freed and can be re-booked. (On an existing DB, build/repair it on demand
// by running scripts/v4/build-unique-slot-index.ts on demand.)
AppointmentSchema.index(
  { date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ACTIVE_APPOINTMENT_STATUSES } },
    name: 'uniq_active_slot',
  },
);
