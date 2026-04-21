import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LeadStatus } from '../common/enums/lead-status.enum';
import { DEFAULT_SOURCE, DEFAULT_LEAD_TREATMENT } from '../common/constants/defaults.constants';

export type LeadDocument = HydratedDocument<Lead>;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  concern: string;

  @Prop({ default: DEFAULT_LEAD_TREATMENT })
  treatment: string;

  @Prop()
  preferredDate: string;

  @Prop()
  preferredTime: string;

  @Prop()
  notes: string;

  @Prop({ enum: Object.values(LeadStatus), default: LeadStatus.NEW })
  status: LeadStatus;

  @Prop({ default: DEFAULT_SOURCE })
  source: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
