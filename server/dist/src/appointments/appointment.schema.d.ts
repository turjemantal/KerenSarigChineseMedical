import { HydratedDocument } from 'mongoose';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
export type AppointmentDocument = HydratedDocument<Appointment>;
export declare class Appointment {
    name: string;
    phone: string;
    email: string;
    treatment: string;
    concern: string;
    date: string;
    time: string;
    notes: string;
    status: AppointmentStatus;
    source: string;
}
export declare const AppointmentSchema: import("mongoose").Schema<Appointment, import("mongoose").Model<Appointment, any, any, any, import("mongoose").Document<unknown, any, Appointment, any, {}> & Appointment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Appointment, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Appointment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Appointment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
