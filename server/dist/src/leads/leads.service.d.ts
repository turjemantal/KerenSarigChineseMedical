import { LeadsDao } from './leads.dao';
import { LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
export declare class LeadsService {
    private readonly leadsDao;
    constructor(leadsDao: LeadsDao);
    create(dto: CreateLeadDto): Promise<LeadDocument>;
    findAll(): Promise<LeadDocument[]>;
    findById(id: string): Promise<LeadDocument>;
    update(id: string, dto: UpdateLeadDto): Promise<LeadDocument>;
    delete(id: string): Promise<void>;
}
