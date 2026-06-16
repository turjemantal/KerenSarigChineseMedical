import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ClientsManager } from './clients.manager';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { createClientSchema } from './dto/validations/client.schemas';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly manager: ClientsManager) {}

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.manager.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body(new JoiValidationPipe(createClientSchema)) dto: CreateClientDto) {
    return this.manager.create(dto);
  }
}
