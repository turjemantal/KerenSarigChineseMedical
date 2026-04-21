import { Model } from 'mongoose';
import { LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
export declare class LeadsDao {
    private model;
    constructor(model: Model<LeadDocument>);
    create(dto: CreateLeadDto): Promise<LeadDocument>;
    findAll(): Promise<LeadDocument[]>;
    findById(id: string): Promise<LeadDocument | null>;
    update(id: string, dto: UpdateLeadDto): Promise<LeadDocument | null>;
    delete(id: string): Promise<LeadDocument | null>;
}
