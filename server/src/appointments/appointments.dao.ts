import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus, ACTIVE_APPOINTMENT_STATUSES } from '../common/enums/appointment-status.enum';

@Injectable()
export class AppointmentsDao {
  constructor(@InjectModel(Appointment.name) private model: Model<AppointmentDocument>) {}

  create(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    return this.model.create(dto);
  }

  findAll(): Promise<AppointmentDocument[]> {
    return this.model.find().sort({ date: 1, time: 1 }).exec();
  }

  // Only ACTIVE (pending/scheduled) appointments occupy a slot — cancelled, rejected,
  // completed and no-show all free it. These two feed the availability calculation, so
  // they must mirror the unique-slot index's partial filter exactly.
  findByDate(date: string): Promise<AppointmentDocument[]> {
    return this.model.find({ date, status: { $in: ACTIVE_APPOINTMENT_STATUSES } }).exec();
  }

  findBetween(from: string, to: string): Promise<AppointmentDocument[]> {
    return this.model
      .find({ date: { $gte: from, $lte: to }, status: { $in: ACTIVE_APPOINTMENT_STATUSES } })
      .exec();
  }

  findByPhone(phone: string): Promise<AppointmentDocument[]> {
    return this.model.find({ phone }).sort({ date: 1, time: 1 }).exec();
  }

  findById(id: string): Promise<AppointmentDocument | null> {
    return this.model.findById(id).exec();
  }

  findScheduledForDate(date: string): Promise<AppointmentDocument[]> {
    return this.model.find({
      date,
      status: AppointmentStatus.SCHEDULED,
      reminderSent: false,
    }).exec();
  }

  update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument | null> {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  markReminderSent(id: string): Promise<AppointmentDocument | null> {
    return this.model.findByIdAndUpdate(id, { reminderSent: true }, { new: true }).exec();
  }

  async autoCompleteScheduledBefore(date: string): Promise<number> {
    const result = await this.model
      .updateMany(
        { status: AppointmentStatus.SCHEDULED, date: { $lte: date } },
        { $set: { status: AppointmentStatus.COMPLETED } },
      )
      .exec();
    return result.modifiedCount;
  }

  setCalendarEventId(id: string, eventId: string): Promise<AppointmentDocument | null> {
    return this.model.findByIdAndUpdate(id, { googleCalendarEventId: eventId }, { new: true }).exec();
  }

  delete(id: string): Promise<AppointmentDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
