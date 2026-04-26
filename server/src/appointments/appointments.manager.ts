import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppointmentsService } from './appointments.service';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { WhatsappService } from '../integrations/whatsapp/whatsapp.service';
import { WHATSAPP_TEMPLATE } from '../integrations/whatsapp/whatsapp.constants';
import { bookingParams, reminderParams } from '../common/constants/messages.constants';

@Injectable()
export class AppointmentsManager {
  private readonly logger = new Logger(AppointmentsManager.name);

  constructor(
    private readonly service: AppointmentsService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async book(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const appt = await this.service.create(dto);
    void this.whatsapp.sendTemplate(
      appt.phone,
      WHATSAPP_TEMPLATE.BOOKING_CONFIRMATION,
      bookingParams(appt.name, appt.date, appt.time),
    );
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

  @Cron('0 9 * * *')
  async sendDailyReminders(): Promise<void> {
    const tomorrow = this.getTomorrowDate();
    const appointments = await this.service.findScheduledForDate(tomorrow);

    this.logger.log(`[Reminders] Sending ${appointments.length} reminder(s) for ${tomorrow}`);

    for (const appt of appointments) {
      await this.whatsapp.sendTemplate(
        appt.phone,
        WHATSAPP_TEMPLATE.APPOINTMENT_REMINDER,
        reminderParams(appt.time),
      );
      await this.service.markReminderSent(String(appt._id));
    }
  }

  private getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
}
