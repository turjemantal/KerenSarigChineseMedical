import { AppointmentsManager } from './appointments.manager';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
interface AuthUser {
    clientId: string;
    phone: string;
    name?: string;
}
export declare class AppointmentsController {
    private readonly manager;
    constructor(manager: AppointmentsManager);
    create(user: AuthUser, dto: CreateAppointmentDto): Promise<import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    findMine(user: AuthUser): Promise<(import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getAvailability(date: string): Promise<string[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateAppointmentDto): Promise<import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    approve(id: string): Promise<import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    cancelOwn(id: string, user: AuthUser): Promise<import("mongoose").Document<unknown, {}, import("./appointment.schema").Appointment, {}, {}> & import("./appointment.schema").Appointment & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<void>;
}
export {};
