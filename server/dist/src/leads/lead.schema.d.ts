import { HydratedDocument } from 'mongoose';
import { LeadStatus } from '../common/enums/lead-status.enum';
export type LeadDocument = HydratedDocument<Lead>;
export declare class Lead {
    name: string;
    phone: string;
    email: string;
    concern: string;
    treatment: string;
    preferredDate: string;
    preferredTime: string;
    notes: string;
    status: LeadStatus;
    source: string;
}
export declare const LeadSchema: import("mongoose").Schema<Lead, import("mongoose").Model<Lead, any, any, any, import("mongoose").Document<unknown, any, Lead, any, {}> & Lead & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Lead, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Lead>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Lead> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
