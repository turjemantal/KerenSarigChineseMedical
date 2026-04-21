import { LeadsService } from './leads.service';
import { LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
export declare class LeadsManager {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    submitLead(dto: CreateLeadDto): Promise<LeadDocument>;
    getAll(): Promise<LeadDocument[]>;
    getById(id: string): Promise<LeadDocument>;
    updateStatus(id: string, dto: UpdateLeadDto): Promise<LeadDocument>;
    remove(id: string): Promise<void>;
}
