import { LeadsManager } from './leads.manager';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
export declare class LeadsController {
    private readonly leadsManager;
    constructor(leadsManager: LeadsManager);
    create(dto: CreateLeadDto): Promise<import("mongoose").Document<unknown, {}, import("./lead.schema").Lead, {}, {}> & import("./lead.schema").Lead & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./lead.schema").Lead, {}, {}> & import("./lead.schema").Lead & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./lead.schema").Lead, {}, {}> & import("./lead.schema").Lead & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateLeadDto): Promise<import("mongoose").Document<unknown, {}, import("./lead.schema").Lead, {}, {}> & import("./lead.schema").Lead & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<void>;
}
