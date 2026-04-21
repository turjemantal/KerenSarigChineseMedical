import { Injectable } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsManager {
  constructor(private readonly leadsService: LeadsService) {}

  async submitLead(dto: CreateLeadDto): Promise<LeadDocument> {
    const lead = await this.leadsService.create(dto);
    // future: send notification SMS/email here
    return lead;
  }

  getAll(): Promise<LeadDocument[]> {
    return this.leadsService.findAll();
  }

  getById(id: string): Promise<LeadDocument> {
    return this.leadsService.findById(id);
  }

  updateStatus(id: string, dto: UpdateLeadDto): Promise<LeadDocument> {
    return this.leadsService.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.leadsService.delete(id);
  }
}
