import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientsDao } from './clients.dao';
import { ClientDocument } from './client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { ERRORS } from '../common/constants/errors.constants';

@Injectable()
export class ClientsService {
  constructor(private readonly dao: ClientsDao) {}

  findAll(): Promise<ClientDocument[]> {
    return this.dao.findAll();
  }

  // admin-created client — phone must be free (it's the unique key)
  async create(dto: CreateClientDto): Promise<ClientDocument> {
    const existing = await this.dao.findByPhone(dto.phone);
    if (existing) throw new BadRequestException(ERRORS.CLIENT_ALREADY_EXISTS);
    return this.dao.create(dto.phone, dto.name);
  }

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
