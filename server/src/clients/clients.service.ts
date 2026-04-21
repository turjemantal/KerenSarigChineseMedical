import { Injectable } from '@nestjs/common';
import { ClientsDao } from './clients.dao';
import { ClientDocument } from './client.schema';

@Injectable()
export class ClientsService {
  constructor(private readonly dao: ClientsDao) {}

  findByPhone(phone: string): Promise<ClientDocument | null> {
    return this.dao.findByPhone(phone);
  }

  async findOrCreate(phone: string, name?: string): Promise<ClientDocument> {
    const existing = await this.dao.findByPhone(phone);
    if (existing) {
      if (name && !existing.name) await this.dao.update(phone, name);
      return existing;
    }
    return this.dao.create(phone, name);
  }

  updateName(phone: string, name: string): Promise<ClientDocument | null> {
    return this.dao.update(phone, name);
  }
}
