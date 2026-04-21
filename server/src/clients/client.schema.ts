import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  name: string;

  @Prop()
  email: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
