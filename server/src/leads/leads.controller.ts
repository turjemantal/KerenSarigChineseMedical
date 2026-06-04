import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LeadsManager } from './leads.manager';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { createLeadSchema, updateLeadSchema } from './dto/validations/lead.schemas';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsManager: LeadsManager) {}

  @Post()
  create(@Body(new JoiValidationPipe(createLeadSchema)) dto: CreateLeadDto) {
    return this.leadsManager.submitLead(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.leadsManager.getAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsManager.getById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateLeadSchema)) dto: UpdateLeadDto,
  ) {
    return this.leadsManager.updateStatus(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsManager.remove(id);
  }
}
