import { Injectable } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsManager {
  constructor(private readonly service: AppointmentsService) {}

  async book(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const appt = await this.service.create(dto);
    // future: send confirmation SMS/email here
    return appt;
  }

  getAll(): Promise<AppointmentDocument[]> {
    return this.service.findAll();
  }

  getAvailability(date: string): Promise<string[]> {
    return this.service.findByDate(date).then(appts => appts.map(a => a.time));
  }

  getByPhone(phone: string): Promise<AppointmentDocument[]> {
    return this.service.findByPhone(phone);
  }

  getById(id: string): Promise<AppointmentDocument> {
    return this.service.findById(id);
  }

  update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument> {
    return this.service.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.service.delete(id);
  }
}
