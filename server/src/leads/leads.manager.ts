import { Inject, Injectable, Logger } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { MESSAGING_PROVIDER } from '../integrations/messaging/messaging.token';
import { IMessagingProvider } from '../integrations/messaging/messaging-provider.interface';
import { config } from '../config';
import { maskPhone } from '../common/utils/phone.utils';

@Injectable()
export class LeadsManager {
  private readonly logger = new Logger(LeadsManager.name);

  constructor(
    private readonly leadsService: LeadsService,
    @Inject(MESSAGING_PROVIDER) private readonly messaging: IMessagingProvider,
  ) {}

  async submitLead(dto: CreateLeadDto): Promise<LeadDocument> {
    const lead = await this.leadsService.create(dto);
    const id = String(lead._id);
    this.logger.log(`[Lead] created lead=${id} phone=${maskPhone(lead.phone)}`);
    // alert the clinic owner (fire-and-forget) so a new lead is noticed immediately
    if (config.adminPhone) {
      this.messaging
        .sendNewLeadAlert(config.adminPhone, lead.name, lead.phone, lead.concern)
        .then(() => this.logger.log(`[Lead] admin-alert sent lead=${id}`))
        .catch((e) => this.logger.error(`[Lead] admin-alert FAILED lead=${id}: ${e}`));
    }
    return lead;
  }

  getAll(): Promise<LeadDocument[]> {
    return this.leadsService.findAll();
  }

  getById(id: string): Promise<LeadDocument> {
    return this.leadsService.findById(id);
  }

  async updateStatus(id: string, dto: UpdateLeadDto): Promise<LeadDocument> {
    const lead = await this.leadsService.update(id, dto);
    this.logger.log(`[Lead] updated lead=${id}${dto.status ? ` status=${dto.status}` : ''}`);
    return lead;
  }

  async remove(id: string): Promise<void> {
    await this.leadsService.delete(id);
    this.logger.log(`[Lead] deleted lead=${id}`);
  }
}
