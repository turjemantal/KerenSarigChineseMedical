import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppointmentsService } from './appointments.service';
import { ScheduleBlocksManager } from '../schedule-blocks/schedule-blocks.manager';
import { WeeklyScheduleManager } from '../weekly-schedule/weekly-schedule.manager';
import { ClientsManager } from '../clients/clients.manager';
import { AppointmentDocument } from './appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { MESSAGING_PROVIDER } from '../integrations/messaging/messaging.token';
import { IMessagingProvider } from '../integrations/messaging/messaging-provider.interface';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { ERRORS } from '../common/constants/errors.constants';
import { MAX_PUBLIC_RANGE_DAYS, DATE_REGEX } from '../common/constants/validation.constants';
import { config } from '../config';
import { ADMIN_SOURCE, CLINIC_TIMEZONE } from '../common/constants/defaults.constants';
import { MAX_BOOKING_AHEAD_DAYS, DAILY_REMINDER_HOUR, AUTO_COMPLETE_HOUR, FREE_CANCELLATION_HOURS } from '../common/constants/schedule.constants';
import { MS_PER_HOUR, MS_PER_DAY } from '../common/constants/time.constants';
import { clinicToday, clinicTimeNow, eachDateInRange, addDays, weekdayOf } from '../common/utils/date.utils';
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
    private readonly weeklySchedule: WeeklyScheduleManager,
    private readonly clients: ClientsManager,
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

  // admin-created appointment: the client is identified by the phone/name in the
  // body (not a JWT). Confirmed immediately and the client gets a confirmation SMS;
  // no admin alert (the admin is the one creating it).
  async bookForClient(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const phone = dto.phone!;
    const name = dto.name || phone;

    // still server-authoritative — the slot must be genuinely free
    const available = await this.getAvailability(dto.date);
    if (!available.includes(dto.time)) {
      throw new BadRequestException(ERRORS.SLOT_NOT_AVAILABLE);
    }

    await this.clients.findOrCreate(phone, dto.name);
    const appt = await this.service.create({
      ...dto,
      phone,
      name,
      status: AppointmentStatus.SCHEDULED,
      source: ADMIN_SOURCE,
    });
    const id = String(appt._id);
    this.logger.log(
      `[Appointment] admin-booked appt=${id} phone=${maskPhone(appt.phone)} ${appt.date} ${appt.time} status=${appt.status}`,
    );
    this.notify('confirmation', id, this.messaging.sendBookingConfirmation(appt.phone, appt.name, appt.date, appt.time));
    return appt;
  }

  // fire-and-forget messaging, but log the real outcome tied to the appointment id
  private notify(kind: string, apptId: string, p: Promise<boolean>): void {
    p.then((ok) =>
      ok
        ? this.logger.log(`[Appointment] sms=${kind} sent appt=${apptId}`)
        : this.logger.warn(`[Appointment] sms=${kind} not sent appt=${apptId}`),
    ).catch((e) => this.logger.error(`[Appointment] sms=${kind} FAILED appt=${apptId}: ${e}`));
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
    if ((Date.parse(to) - Date.parse(from)) / MS_PER_DAY > MAX_PUBLIC_RANGE_DAYS) {
      throw new BadRequestException(ERRORS.dateRangeTooLarge(MAX_PUBLIC_RANGE_DAYS));
    }

    const [appts, blocks, extras, schedule] = await Promise.all([
      this.service.findBetween(from, to),
      this.scheduleBlocks.getBlocksInRange(from, to),
      this.scheduleBlocks.getExtraSlotsInRange(from, to),
      this.weeklySchedule.getSchedule(),
    ]);
    const today = clinicToday();
    const nowTime = clinicTimeNow();
    const maxDate = addDays(today, MAX_BOOKING_AHEAD_DAYS);

    const result: Record<string, string[]> = {};
    for (const date of eachDateInRange(from, to)) {
      const slots = computeAvailableSlots({
        date,
        baseTimes: schedule[weekdayOf(date)] ?? [],
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

  // a client may move their own appointment to a new slot, but only while still in
  // the free window (more than FREE_CANCELLATION_HOURS before it). Server-authoritative:
  // ownership, an active status, the free window, and slot availability are all
  // re-checked here regardless of what the client sent. Status is preserved.
  async rescheduleOwn(id: string, phone: string, newDate: string, newTime: string): Promise<AppointmentDocument> {
    const appt = await this.service.findById(id);
    if (appt.phone !== phone) {
      throw new ForbiddenException();
    }
    if (appt.status !== AppointmentStatus.SCHEDULED && appt.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException(ERRORS.CANNOT_RESCHEDULE_STATUS);
    }
    if (this.hoursUntil(appt.date, appt.time) < FREE_CANCELLATION_HOURS) {
      throw new BadRequestException(ERRORS.rescheduleTooLate(FREE_CANCELLATION_HOURS));
    }
    const available = await this.getAvailability(newDate);
    if (!available.includes(newTime)) {
      throw new BadRequestException(ERRORS.SLOT_NOT_AVAILABLE);
    }
    const updated = await this.service.update(id, { date: newDate, time: newTime });
    this.logger.log(
      `[Appointment] rescheduled appt=${id} phone=${maskPhone(updated.phone)} → ${updated.date} ${updated.time} status=${updated.status}`,
    );
    this.notify('reschedule', id, this.messaging.sendBookingConfirmation(updated.phone, updated.name, updated.date, updated.time));
    return updated;
  }

  // hours from clinic-now until the given clinic-local date+time. Both sides are
  // parsed in the same (UTC) frame so the timezone offset cancels and the result is
  // the true clinic-local gap — mirrors the client's free-window check, authoritatively.
  private hoursUntil(date: string, time: string): number {
    const apptMs = Date.parse(`${date}T${time}:00Z`);
    const nowMs = Date.parse(`${clinicToday()}T${clinicTimeNow()}:00Z`);
    return (apptMs - nowMs) / MS_PER_HOUR;
  }

  approve(id: string): Promise<AppointmentDocument> {
    return this.update(id, { status: AppointmentStatus.SCHEDULED });
  }

  markNoShow(id: string): Promise<AppointmentDocument> {
    return this.update(id, { status: AppointmentStatus.NOSHOW });
  }

  async remove(id: string): Promise<void> {
    await this.service.delete(id);
    this.logger.log(`[Appointment] deleted appt=${id}`);
  }

  // Pinned to clinic time so it fires at 09:00 Israel regardless of the container's
  // (UTC) clock, and "tomorrow" is the clinic-local next day — both must agree with
  // the timezone-aware dates used everywhere else (clinicToday/addDays).
  @Cron(`0 ${DAILY_REMINDER_HOUR} * * *`, { timeZone: CLINIC_TIMEZONE })
  async sendDailyReminders(): Promise<void> {
    const tomorrow = addDays(clinicToday(), 1);
    const appointments = await this.service.findScheduledForDate(tomorrow);

    this.logger.log(`[Reminders] Sending ${appointments.length} reminder(s) for ${tomorrow}`);

    for (const appt of appointments) {
      const id = String(appt._id);
      const sent = await this.messaging.sendAppointmentReminder(appt.phone, appt.time);
      // only mark as reminded when the send actually succeeded — a failed one stays
      // unmarked so it shows as "not sent" and can be re-sent manually (sendReminder).
      if (sent) {
        await this.service.markReminderSent(id);
        this.logger.log(`[Appointment] reminder sent appt=${id} phone=${maskPhone(appt.phone)} ${appt.time}`);
      } else {
        this.logger.warn(`[Appointment] reminder NOT sent (left unmarked) appt=${id} phone=${maskPhone(appt.phone)} ${appt.time}`);
      }
    }
  }

  // Nightly: auto-complete all scheduled appointments from before today.
  // Runs at AUTO_COMPLETE_HOUR (23:00) so Keren has the full day to mark no-shows.
  // This keeps the admin list clean and ensures client visit counts are accurate.
  @Cron(`0 ${AUTO_COMPLETE_HOUR} * * *`, { timeZone: CLINIC_TIMEZONE })
  async autoCompletePastAppointments(): Promise<void> {
    const today = clinicToday();
    const count = await this.service.autoCompleteScheduledBefore(today);
    if (count > 0) {
      this.logger.log(`[Appointments] auto-completed ${count} past scheduled appointment(s)`);
    }
  }

  // admin: (re)send the reminder for a single appointment on demand — e.g. after a
  // failed automatic send. Marks it reminded on success; surfaces an error on failure.
  async sendReminder(id: string): Promise<AppointmentDocument> {
    const appt = await this.service.findById(id);
    const sent = await this.messaging.sendAppointmentReminder(appt.phone, appt.time);
    if (!sent) {
      this.logger.warn(`[Appointment] manual reminder FAILED appt=${id} phone=${maskPhone(appt.phone)}`);
      throw new ServiceUnavailableException(ERRORS.REMINDER_SEND_FAILED);
    }
    await this.service.markReminderSent(id);
    this.logger.log(`[Appointment] manual reminder sent appt=${id} phone=${maskPhone(appt.phone)} ${appt.time}`);
    return appt;
  }
}
