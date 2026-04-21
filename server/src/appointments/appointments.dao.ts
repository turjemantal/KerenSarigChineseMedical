import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsDao {
  constructor(@InjectModel(Appointment.name) private model: Model<AppointmentDocument>) {}

  create(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    return this.model.create(dto);
  }

  findAll(): Promise<AppointmentDocument[]> {
    return this.model.find().sort({ date: 1, time: 1 }).exec();
  }

  findByDate(date: string): Promise<AppointmentDocument[]> {
    return this.model.find({ date, status: { $ne: 'cancelled' } }).exec();
  }

  findByPhone(phone: string): Promise<AppointmentDocument[]> {
    return this.model.find({ phone }).sort({ date: 1, time: 1 }).exec();
  }

  findById(id: string): Promise<AppointmentDocument | null> {
    return this.model.findById(id).exec();
  }

  update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument | null> {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string): Promise<AppointmentDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
