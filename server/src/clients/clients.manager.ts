import { Injectable, Logger } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientDocument } from './client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { maskPhone } from '../common/utils/phone.utils';

// Thin orchestration layer so other modules' managers (e.g. appointments) can
// reach clients through a manager rather than the service, per the layering rules.
@Injectable()
export class ClientsManager {
  private readonly logger = new Logger(ClientsManager.name);

  constructor(private readonly service: ClientsService) {}

  findAll(): Promise<ClientDocument[]> {
    return this.service.findAll();
  }

  async create(dto: CreateClientDto): Promise<ClientDocument> {
    const client = await this.service.create(dto);
    this.logger.log(`[Client] created client=${String(client._id)} phone=${maskPhone(client.phone)}`);
    return client;
  }

  findOrCreate(phone: string, name?: string): Promise<ClientDocument> {
    return this.service.findOrCreate(phone, name);
  }
}
