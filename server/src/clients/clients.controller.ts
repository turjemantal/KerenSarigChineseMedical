import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AdminAuthGuard } from '../auth/admin-auth.guard';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
