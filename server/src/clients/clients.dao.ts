import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './client.schema';

@Injectable()
export class ClientsDao {
  constructor(@InjectModel(Client.name) private model: Model<ClientDocument>) {}

  findByPhone(phone: string): Promise<ClientDocument | null> {
    return this.model.findOne({ phone }).exec();
  }

  create(phone: string, name?: string, email?: string): Promise<ClientDocument> {
    return this.model.create({ phone, name, email });
  }

  update(phone: string, name: string): Promise<ClientDocument | null> {
    return this.model.findOneAndUpdate({ phone }, { name }, { new: true }).exec();
  }
}
