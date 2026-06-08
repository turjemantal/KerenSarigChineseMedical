import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppointmentsService } from './appointments.service';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { MESSAGING_PROVIDER } from '../integrations/messaging/messaging.token';
import { IMessagingProvider } from '../integrations/messaging/messaging-provider.interface';

@Injectable()
export class AppointmentsManager {
  private readonly logger = new Logger(AppointmentsManager.name);

  constructor(
    private readonly service: AppointmentsService,
    @Inject(MESSAGING_PROVIDER) private readonly messaging: IMessagingProvider,
  ) {}

  async book(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const appt = await this.service.create(dto);
    void this.messaging.sendBookingConfirmation(appt.phone, appt.name, appt.date, appt.time);
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
      await this.messaging.sendAppointmentReminder(appt.phone, appt.time);
      await this.service.markReminderSent(String(appt._id));
    }
  }

  private getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
}
