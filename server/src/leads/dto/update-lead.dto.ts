import { IsOptional, IsString } from 'class-validator';
import { LeadStatus } from '../../common/enums/lead-status.enum';

export class UpdateLeadDto {
  @IsOptional() @IsString()
  status?: LeadStatus;

  @IsOptional() @IsString()
  notes?: string;
}
