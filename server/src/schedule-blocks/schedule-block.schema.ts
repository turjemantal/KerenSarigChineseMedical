import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScheduleBlockDocument = HydratedDocument<ScheduleBlock>;

// A blocked period in the clinic calendar.
// Full day(s) when no times are set (single day closure or multi-day vacation);
// a specific hour range when startTime/endTime are set.
@Schema({ timestamps: true })
export class ScheduleBlock {
  @Prop({ required: true })
  startDate: string; // YYYY-MM-DD

  @Prop({ required: true })
  endDate: string; // YYYY-MM-DD (inclusive)

  @Prop()
  startTime?: string; // HH:MM

  @Prop()
  endTime?: string; // HH:MM (exclusive)

  @Prop()
  reason?: string;
}

export const ScheduleBlockSchema = SchemaFactory.createForClass(ScheduleBlock);
