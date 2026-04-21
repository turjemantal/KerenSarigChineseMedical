import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadsDao } from './leads.dao';
import { LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly leadsDao: LeadsDao) {}

  create(dto: CreateLeadDto): Promise<LeadDocument> {
    return this.leadsDao.create(dto);
  }

  findAll(): Promise<LeadDocument[]> {
    return this.leadsDao.findAll();
  }

  async findById(id: string): Promise<LeadDocument> {
    const lead = await this.leadsDao.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto): Promise<LeadDocument> {
    const lead = await this.leadsDao.update(id, dto);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async delete(id: string): Promise<void> {
    const lead = await this.leadsDao.delete(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
  }
}
