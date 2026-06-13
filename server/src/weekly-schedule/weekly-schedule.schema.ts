import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeeklyScheduleDayDocument = HydratedDocument<WeeklyScheduleDay>;

// The clinic's base bookable start times for one weekday (0=Sunday … 6=Saturday).
// Only days the admin has customised are stored; the rest fall back to defaults.
@Schema({ timestamps: true })
export class WeeklyScheduleDay {
  @Prop({ required: true, unique: true, min: 0, max: 6 })
  weekday: number;

  @Prop({ type: [String], default: [] })
  times: string[]; // HH:MM, sorted ascending
}

export const WeeklyScheduleDaySchema = SchemaFactory.createForClass(WeeklyScheduleDay);
