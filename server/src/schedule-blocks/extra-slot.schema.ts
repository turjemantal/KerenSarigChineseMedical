import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExtraSlotDocument = HydratedDocument<ExtraSlot>;

// An extra bookable time the admin opens on a specific date, beyond the base
// weekly schedule (e.g. a one-off appointment on a normally-closed day).
@Schema({ timestamps: true })
export class ExtraSlot {
  @Prop({ required: true })
  date: string; // YYYY-MM-DD

  @Prop({ required: true })
  time: string; // HH:MM
}

export const ExtraSlotSchema = SchemaFactory.createForClass(ExtraSlot);
// one document per date+time — no duplicate opens
ExtraSlotSchema.index({ date: 1, time: 1 }, { unique: true });
