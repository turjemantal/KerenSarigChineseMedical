import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppointmentsService } from './appointments.service';
import { ScheduleBlocksManager } from '../schedule-blocks/schedule-blocks.manager';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { MESSAGING_PROVIDER } from '../integrations/messaging/messaging.token';
import { IMessagingProvider } from '../integrations/messaging/messaging-provider.interface';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { ERRORS } from '../common/constants/errors.constants';
import { CLOSED_WEEKDAYS } from '../common/constants/defaults.constants';
import { config } from '../config';
import { clinicToday, clinicTimeNow, weekdayOf } from '../common/utils/date.utils';

@Injectable()
export class AppointmentsManager {
  private readonly logger = new Logger(AppointmentsManager.name);

  constructor(
    private readonly service: AppointmentsService,
    private readonly scheduleBlocks: ScheduleBlocksManager,
    @Inject(MESSAGING_PROVIDER) private readonly messaging: IMessagingProvider,
  ) {}

  async book(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    this.assertBookable(dto.date, dto.time);
    await this.assertNotBlocked(dto.date, dto.time);
    const appt = await this.service.create(dto);
    void this.messaging.sendBookingRequestReceived(appt.phone, appt.name, appt.date, appt.time);
    if (config.adminPhone) {
      void this.messaging.sendNewBookingAlert(config.adminPhone, appt.name, appt.date, appt.time);
    }
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

  async update(id: string, dto: UpdateAppointmentDto): Promise<AppointmentDocument> {
    const existing = await this.service.findById(id);
    const updated = await this.service.update(id, dto);
    const approved =
      existing.status === AppointmentStatus.PENDING && updated.status === AppointmentStatus.SCHEDULED;
    if (approved) {
      void this.messaging.sendBookingConfirmation(updated.phone, updated.name, updated.date, updated.time);
    }
    return updated;
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

  // only future slots on working days are bookable — evaluated on the clinic's clock
  private assertBookable(date: string, time: string): void {
    const today = clinicToday();
    if (date < today) {
      throw new BadRequestException(ERRORS.DATE_IN_PAST);
    }
    if (date === today && time <= clinicTimeNow()) {
      throw new BadRequestException(ERRORS.TIME_IN_PAST);
    }
    if (CLOSED_WEEKDAYS.includes(weekdayOf(date))) {
      throw new BadRequestException(ERRORS.CLOSED_WEEKDAY);
    }
  }

  private async assertNotBlocked(date: string, time: string): Promise<void> {
    const blocks = await this.scheduleBlocks.getBlocksForDate(date);
    const blocked = blocks.some(b =>
      !b.startTime || !b.endTime ? true : time >= b.startTime && time < b.endTime,
    );
    if (blocked) {
      throw new BadRequestException(ERRORS.SLOT_BLOCKED);
    }
  }

  private getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
}
