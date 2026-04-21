import { AppointmentsService } from './appointments.service';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsManager {
    private readonly service;
    constructor(service: AppointmentsService);
    book(dto: CreateAppointmentDto): Promise<AppointmentDocument>;
    getAll(): Promise<AppointmentDocument[]>;
    getAvailability(date: string): Promise<string[]>;
    getByPhone(phone: string): Promise<AppointmentDocument[]>;
    getById(id: string): Promise<AppointmentDocument>;
    update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument>;
    remove(id: string): Promise<void>;
}
