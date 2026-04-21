import { AppointmentsDao } from './appointments.dao';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsService {
    private readonly dao;
    constructor(dao: AppointmentsDao);
    create(dto: CreateAppointmentDto): Promise<AppointmentDocument>;
    findAll(): Promise<AppointmentDocument[]>;
    findByDate(date: string): Promise<AppointmentDocument[]>;
    findByPhone(phone: string): Promise<AppointmentDocument[]>;
    findById(id: string): Promise<AppointmentDocument>;
    update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument>;
    delete(id: string): Promise<void>;
}
