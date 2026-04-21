import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LeadsManager } from './leads.manager';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JoiBody } from '../common/guards/joi-body.decorator';
import { createLeadSchema, updateLeadSchema } from './validations/lead.schemas';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsManager: LeadsManager) {}

  @Post()
  @JoiBody(createLeadSchema)
  create(@Body() dto: CreateLeadDto) {
    return this.leadsManager.submitLead(dto);
  }

  @Get()
  findAll() {
    return this.leadsManager.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsManager.getById(id);
  }

  @Patch(':id')
  @JoiBody(updateLeadSchema)
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsManager.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsManager.remove(id);
  }
}
