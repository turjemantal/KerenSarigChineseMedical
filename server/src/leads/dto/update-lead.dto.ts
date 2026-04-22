import { LeadStatus } from '../../common/enums/lead-status.enum';

export class UpdateLeadDto {
  status?: LeadStatus;
  notes?: string;
}
