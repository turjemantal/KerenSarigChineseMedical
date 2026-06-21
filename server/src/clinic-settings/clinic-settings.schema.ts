import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MIN_BOOKING_AHEAD_DAYS, MIN_HOUR, MAX_HOUR } from '../common/constants/clinic-settings.constants';

export type ClinicSettingsDocument = HydratedDocument<ClinicSettings>;

// Clinic-wide configurable settings. A single document holds the whole config; the
// service falls back to code defaults when it is absent, so a fresh DB still works.
@Schema({ timestamps: true })
export class ClinicSettings {
  // how far ahead clients may book, in days (the booking horizon)
  @Prop({ required: true, min: MIN_BOOKING_AHEAD_DAYS })
  bookingAheadDays: number;

  // clinic-local hour (0–23) the daily reminders are sent at
  @Prop({ required: true, min: MIN_HOUR, max: MAX_HOUR })
  reminderHour: number;
}

export const ClinicSettingsSchema = SchemaFactory.createForClass(ClinicSettings);
