import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OTP_EXPIRY_MS } from '../common/constants/otp.constants';

export type OtpDocument = HydratedDocument<Otp>;

@Schema()
export class Otp {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: () => new Date(Date.now() + OTP_EXPIRY_MS) })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
// TTL index — MongoDB removes the document automatically when expiresAt is reached
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
