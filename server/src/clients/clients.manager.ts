import { Injectable } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientDocument } from './client.schema';
import { CreateClientDto } from './dto/create-client.dto';

// Thin orchestration layer so other modules' managers (e.g. appointments) can
// reach clients through a manager rather than the service, per the layering rules.
@Injectable()
export class ClientsManager {
  constructor(private readonly service: ClientsService) {}

  findAll(): Promise<ClientDocument[]> {
    return this.service.findAll();
  }

  create(dto: CreateClientDto): Promise<ClientDocument> {
    return this.service.create(dto);
  }

  findOrCreate(phone: string, name?: string): Promise<ClientDocument> {
    return this.service.findOrCreate(phone, name);
  }
}
