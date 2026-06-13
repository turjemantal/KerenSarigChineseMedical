import { BadRequestException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
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
import { MAX_PUBLIC_RANGE_DAYS, DATE_REGEX } from '../common/constants/validation.constants';
import { config } from '../config';
import { MAX_BOOKING_AHEAD_DAYS } from '../common/constants/schedule.constants';
import { clinicToday, clinicTimeNow, eachDateInRange, addDays } from '../common/utils/date.utils';
import { maskPhone } from '../common/utils/phone.utils';
import { computeAvailableSlots } from './availability.util';

export interface BookingIdentity {
  phone: string;
  name?: string;
}

@Injectable()
export class AppointmentsManager {
  private readonly logger = new Logger(AppointmentsManager.name);

  constructor(
    private readonly service: AppointmentsService,
    private readonly scheduleBlocks: ScheduleBlocksManager,
    @Inject(MESSAGING_PROVIDER) private readonly messaging: IMessagingProvider,
  ) {}

  async book(dto: CreateAppointmentDto, identity: BookingIdentity): Promise<AppointmentDocument> {
    // the appointment is always tied to the authenticated client's phone;
    // fall back to the phone as a display name if none is known
    const phone = identity.phone;
    const name = dto.name || identity.name || phone;

    // the slot must currently be offered (in the weekly schedule or opened as an
    // extra), not in the past, not blocked, and not already taken
    const available = await this.getAvailability(dto.date);
    if (!available.includes(dto.time)) {
      throw new BadRequestException(ERRORS.SLOT_NOT_AVAILABLE);
    }
    const appt = await this.service.create({ ...dto, phone, name });
    const id = String(appt._id);
    this.logger.log(
      `[Appointment] booked appt=${id} phone=${maskPhone(appt.phone)} ${appt.date} ${appt.time} status=${appt.status}`,
    );
    this.notify('request-received', id, this.messaging.sendBookingRequestReceived(appt.phone, appt.name, appt.date, appt.time));
    if (config.adminPhone) {
      this.notify('admin-alert', id, this.messaging.sendNewBookingAlert(config.adminPhone, appt.name, appt.date, appt.time));
    }
    return appt;
  }

  // fire-and-forget messaging, but log the outcome tied to the appointment id
  private notify(kind: string, apptId: string, p: Promise<void>): void {
    p.then(() => this.logger.log(`[Appointment] sms=${kind} sent appt=${apptId}`))
      .catch((e) => this.logger.error(`[Appointment] sms=${kind} FAILED appt=${apptId}: ${e}`));
  }

  getAll(): Promise<AppointmentDocument[]> {
    return this.service.findAll();
  }

  // free, bookable slots for a single date
  async getAvailability(date: string): Promise<string[]> {
    const map = await this.getAvailabilityRange(date, date);
    return map[date] ?? [];
  }

  // free, bookable slots for every date in a range — { 'YYYY-MM-DD': ['09:00', …] }.
  // Server-authoritative: base weekly schedule ∪ extra slots − taken − blocked − past.
  async getAvailabilityRange(from: string, to: string): Promise<Record<string, string[]>> {
    if (!DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
      throw new BadRequestException(ERRORS.INVALID_DATE_FORMAT);
    }
    if (to < from) throw new BadRequestException(ERRORS.INVALID_DATE_RANGE);
    if ((Date.parse(to) - Date.parse(from)) / 86_400_000 > MAX_PUBLIC_RANGE_DAYS) {
      throw new BadRequestException(ERRORS.dateRangeTooLarge(MAX_PUBLIC_RANGE_DAYS));
    }

    const [appts, blocks, extras] = await Promise.all([
      this.service.findBetween(from, to),
      this.scheduleBlocks.getBlocksInRange(from, to),
      this.scheduleBlocks.getExtraSlotsInRange(from, to),
    ]);
    const today = clinicToday();
    const nowTime = clinicTimeNow();
    const maxDate = addDays(today, MAX_BOOKING_AHEAD_DAYS);

    const result: Record<string, string[]> = {};
    for (const date of eachDateInRange(from, to)) {
      const slots = computeAvailableSlots({
        date,
        extraTimes: extras.filter(e => e.date === date).map(e => e.time),
        takenTimes: appts.filter(a => a.date === date).map(a => a.time),
        blocks: blocks.filter(b => date >= b.startDate && date <= b.endDate),
        today,
        nowTime,
        maxDate,
      });
      if (slots.length) result[date] = slots;
    }
    return result;
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
    if (dto.status && dto.status !== existing.status) {
      this.logger.log(`[Appointment] status appt=${id} ${existing.status} → ${updated.status}`);
    }
    const approved =
      existing.status === AppointmentStatus.PENDING && updated.status === AppointmentStatus.SCHEDULED;
    if (approved) {
      this.logger.log(`[Appointment] approved appt=${id} phone=${maskPhone(updated.phone)}`);
      this.notify('confirmation', id, this.messaging.sendBookingConfirmation(updated.phone, updated.name, updated.date, updated.time));
    }
    return updated;
  }

  // a client may only cancel their own appointment
  async cancelOwn(id: string, phone: string): Promise<AppointmentDocument> {
    const appt = await this.service.findById(id);
    if (appt.phone !== phone) {
      throw new ForbiddenException();
    }
    return this.update(id, { status: AppointmentStatus.CANCELLED });
  }

  // admin approval is just a guarded status transition to scheduled
  approve(id: string): Promise<AppointmentDocument> {
    return this.update(id, { status: AppointmentStatus.SCHEDULED });
  }

  async remove(id: string): Promise<void> {
    await this.service.delete(id);
    this.logger.log(`[Appointment] deleted appt=${id}`);
  }

  @Cron('0 9 * * *')
  async sendDailyReminders(): Promise<void> {
    const tomorrow = this.getTomorrowDate();
    const appointments = await this.service.findScheduledForDate(tomorrow);

    this.logger.log(`[Reminders] Sending ${appointments.length} reminder(s) for ${tomorrow}`);

    for (const appt of appointments) {
      const id = String(appt._id);
      await this.messaging.sendAppointmentReminder(appt.phone, appt.time);
      await this.service.markReminderSent(id);
      this.logger.log(`[Appointment] reminder sent appt=${id} phone=${maskPhone(appt.phone)} ${appt.time}`);
    }
  }

  private getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
}
