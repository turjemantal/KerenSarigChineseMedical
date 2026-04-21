import { Model } from 'mongoose';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsDao {
    private model;
    constructor(model: Model<AppointmentDocument>);
    create(dto: CreateAppointmentDto): Promise<AppointmentDocument>;
    findAll(): Promise<AppointmentDocument[]>;
    findByDate(date: string): Promise<AppointmentDocument[]>;
    findByPhone(phone: string): Promise<AppointmentDocument[]>;
    findById(id: string): Promise<AppointmentDocument | null>;
    update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument | null>;
    delete(id: string): Promise<AppointmentDocument | null>;
}
