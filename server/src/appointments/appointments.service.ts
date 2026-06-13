import { Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { AppointmentsDao } from './appointments.dao';
import { Entity, notFoundMessage } from '../common/constants/errors.constants';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly dao: AppointmentsDao) {}

  create(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    return this.dao.create(dto);
  }

  findAll(): Promise<AppointmentDocument[]> {
    return this.dao.findAll();
  }

  findByDate(date: string): Promise<AppointmentDocument[]> {
    return this.dao.findByDate(date);
  }

  findBetween(from: string, to: string): Promise<AppointmentDocument[]> {
    return this.dao.findBetween(from, to);
  }

  findByPhone(phone: string): Promise<AppointmentDocument[]> {
    return this.dao.findByPhone(phone);
  }

  async findById(id: string): Promise<AppointmentDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException(notFoundMessage(Entity.Appointment, id));
    const appt = await this.dao.findById(id);
    if (!appt) throw new NotFoundException(notFoundMessage(Entity.Appointment, id));
    return appt;
  }

  findScheduledForDate(date: string): Promise<AppointmentDocument[]> {
    return this.dao.findScheduledForDate(date);
  }

  markReminderSent(id: string): Promise<AppointmentDocument | null> {
    return this.dao.markReminderSent(id);
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException(notFoundMessage(Entity.Appointment, id));
    const appt = await this.dao.update(id, dto);
    if (!appt) throw new NotFoundException(notFoundMessage(Entity.Appointment, id));
    return appt;
  }

  async delete(id: string): Promise<void> {
    if (!isValidObjectId(id)) throw new NotFoundException(notFoundMessage(Entity.Appointment, id));
    const appt = await this.dao.delete(id);
    if (!appt) throw new NotFoundException(notFoundMessage(Entity.Appointment, id));
  }
}
