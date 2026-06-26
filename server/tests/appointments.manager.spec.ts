import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AppointmentsManager } from '../src/appointments/appointments.manager';
import { AppointmentsService } from '../src/appointments/appointments.service';
import { ScheduleBlocksManager } from '../src/schedule-blocks/schedule-blocks.manager';
import { WeeklyScheduleManager } from '../src/weekly-schedule/weekly-schedule.manager';
import { ClinicSettingsManager } from '../src/clinic-settings/clinic-settings.manager';
import { ClientsManager } from '../src/clients/clients.manager';
import { MESSAGING_PROVIDER } from '../src/integrations/messaging/messaging.token';
import { GoogleCalendarService } from '../src/integrations/google-calendar/google-calendar.service';
import { AppointmentStatus } from '../src/common/enums/appointment-status.enum';
import { CreateAppointmentDto } from '../src/appointments/dto/create-appointment.dto';
import { clinicToday, clinicHourNow, addDays } from '../src/common/utils/date.utils';

// a date a week out — within the booking horizon, not in the past. Availability
// for it is driven via mocked extra slots so the test is weekday-independent.
const FUTURE_DATE = addDays(clinicToday(), 7);
const FUTURE_TIME = '20:00'; // never part of the base schedule → must come from an extra
const BEYOND_HORIZON = addDays(clinicToday(), 200); // past the default 183-day horizon
const DEFAULT_SETTINGS = { bookingAheadDays: 183, reminderHour: clinicHourNow() };
const appt1 = { _id: 'a1', phone: '0501111111', name: 'Alice', date: FUTURE_DATE, time: FUTURE_TIME, status: AppointmentStatus.PENDING };
const appt2 = { _id: 'a2', phone: '0502222222', name: 'Bob', date: FUTURE_DATE, time: '10:30', status: AppointmentStatus.PENDING };

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByDate: jest.fn(),
  findBetween: jest.fn(),
  findByPhone: jest.fn(),
  findById: jest.fn(),
  findScheduledForDate: jest.fn(),
  markReminderSent: jest.fn(),
  autoCompleteScheduledBefore: jest.fn(),
  update: jest.fn(),
  setCalendarEventId: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn(),
};

const mockMessaging = {
  sendBookingRequestReceived: jest.fn().mockResolvedValue(true),
  sendBookingConfirmation: jest.fn().mockResolvedValue(true),
  sendBookingRejected: jest.fn().mockResolvedValue(true),
  sendAppointmentReminder: jest.fn().mockResolvedValue(true),
  sendNewBookingAlert: jest.fn().mockResolvedValue(true),
};

const mockCalendar = {
  createEvent: jest.fn().mockResolvedValue('evt-123'),
  updateEvent: jest.fn().mockResolvedValue(undefined),
  deleteEvent: jest.fn().mockResolvedValue(undefined),
};

const mockScheduleBlocks = {
  getBlocksForDate: jest.fn(),
  getBlocksInRange: jest.fn(),
  getExtraSlotsInRange: jest.fn(),
};

// empty base schedule by default — booking tests drive availability via extra slots
const EMPTY_SCHEDULE = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
const mockWeeklySchedule = { getSchedule: jest.fn().mockResolvedValue(EMPTY_SCHEDULE) };

// reminderHour defaults to the current clinic hour so the gated daily-reminder cron
// "fires" in tests; horizon defaults to the production default (183 days).
const mockClinicSettings = { getSettings: jest.fn().mockResolvedValue(DEFAULT_SETTINGS) };

const mockClients = {
  findOrCreate: jest.fn().mockResolvedValue({ _id: 'c1' }),
  create: jest.fn(),
  findAll: jest.fn(),
};

const flushVoidPromises = () => new Promise(r => setTimeout(r, 0));

// set up the data the availability computation reads (taken / blocks / extras)
const mockAvailability = (
  { taken = [], blocks = [], extras = [] }: { taken?: object[]; blocks?: object[]; extras?: object[] } = {},
) => {
  mockService.findBetween.mockResolvedValueOnce(taken);
  mockScheduleBlocks.getBlocksInRange.mockResolvedValueOnce(blocks);
  mockScheduleBlocks.getExtraSlotsInRange.mockResolvedValueOnce(extras);
};

describe('AppointmentsManager', () => {
  let manager: AppointmentsManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsManager,
        { provide: AppointmentsService, useValue: mockService },
        { provide: ScheduleBlocksManager, useValue: mockScheduleBlocks },
        { provide: WeeklyScheduleManager, useValue: mockWeeklySchedule },
        { provide: ClinicSettingsManager, useValue: mockClinicSettings },
        { provide: ClientsManager, useValue: mockClients },
        { provide: MESSAGING_PROVIDER, useValue: mockMessaging },
        { provide: GoogleCalendarService, useValue: mockCalendar },
      ],
    }).compile();
    manager = module.get<AppointmentsManager>(AppointmentsManager);
    jest.clearAllMocks();
    mockWeeklySchedule.getSchedule.mockResolvedValue(EMPTY_SCHEDULE);
    mockClinicSettings.getSettings.mockResolvedValue(DEFAULT_SETTINGS);
    mockClients.findOrCreate.mockResolvedValue({ _id: 'c1' });
  });

  describe('book', () => {
    it('creates an appointment tied to the client phone for an available slot', async () => {
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce(appt1);
      const dto: CreateAppointmentDto = { date: FUTURE_DATE, time: FUTURE_TIME, concern: 'כאב גב' };
      const result = await manager.book(dto, { phone: '0501111111', name: 'Alice' });
      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '0501111111', name: 'Alice', concern: 'כאב גב' }),
      );
      expect(result).toMatchObject({ _id: 'a1', status: AppointmentStatus.PENDING });
    });

    it('falls back to the phone as the name when none is provided', async () => {
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce(appt1);
      await manager.book({ date: FUTURE_DATE, time: FUTURE_TIME }, { phone: '0501111111' });
      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '0501111111', name: '0501111111' }),
      );
    });

    it('sends a "request received" message — not a confirmation — on booking', async () => {
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce(appt1);
      await manager.book({ date: FUTURE_DATE, time: FUTURE_TIME }, { phone: '0501111111' });
      await flushVoidPromises();
      expect(mockMessaging.sendBookingRequestReceived).toHaveBeenCalledWith(appt1.phone, appt1.name, appt1.date, appt1.time);
      expect(mockMessaging.sendBookingConfirmation).not.toHaveBeenCalled();
    });

    it('rejects a slot that is not offered (not in schedule, no extra)', async () => {
      mockAvailability(); // nothing → no availability for 09:00 on a Friday
      const dto: CreateAppointmentDto = { date: FUTURE_DATE, time: FUTURE_TIME };
      await expect(manager.book(dto, { phone: '0501111111' })).rejects.toThrow(BadRequestException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('rejects a past date', async () => {
      mockAvailability({ extras: [{ date: '2020-01-01', time: '09:00' }] });
      await expect(manager.book({ date: '2020-01-01', time: '09:00' }, { phone: '0501111111' }))
        .rejects.toThrow(BadRequestException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('rejects a slot that is blocked', async () => {
      mockAvailability({
        extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }],
        blocks: [{ startDate: FUTURE_DATE, endDate: FUTURE_DATE }], // full-day block
      });
      await expect(manager.book({ date: FUTURE_DATE, time: FUTURE_TIME }, { phone: '0501111111' }))
        .rejects.toThrow(BadRequestException);
    });

    it('rejects a slot that is already taken', async () => {
      mockAvailability({
        extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }],
        taken: [{ date: FUTURE_DATE, time: FUTURE_TIME }],
      });
      await expect(manager.book({ date: FUTURE_DATE, time: FUTURE_TIME }, { phone: '0501111111' }))
        .rejects.toThrow(BadRequestException);
    });

    it('alerts the admin phone about the new booking when ADMIN_PHONE is set', async () => {
      process.env.ADMIN_PHONE = '0509999999';
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce(appt1);
      await manager.book({ date: FUTURE_DATE, time: FUTURE_TIME }, { phone: '0501111111' });
      await flushVoidPromises();
      expect(mockMessaging.sendNewBookingAlert).toHaveBeenCalledWith('0509999999', appt1.name, appt1.date, appt1.time);
      delete process.env.ADMIN_PHONE;
    });

    it('skips the admin alert when ADMIN_PHONE is not set', async () => {
      delete process.env.ADMIN_PHONE;
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce(appt1);
      await manager.book({ date: FUTURE_DATE, time: FUTURE_TIME }, { phone: '0501111111' });
      await flushVoidPromises();
      expect(mockMessaging.sendNewBookingAlert).not.toHaveBeenCalled();
    });
  });

  describe('bookForClient (admin)', () => {
    const adminDto = { name: 'Alice', phone: '0501111111', date: FUTURE_DATE, time: FUTURE_TIME };

    it('creates a confirmed appointment for an available slot and links the client', async () => {
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.SCHEDULED });
      const result = await manager.bookForClient(adminDto);
      expect(mockClients.findOrCreate).toHaveBeenCalledWith('0501111111', 'Alice');
      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '0501111111', name: 'Alice', status: AppointmentStatus.SCHEDULED }),
      );
      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
    });

    it('sends the client a confirmation SMS — but no admin alert', async () => {
      process.env.ADMIN_PHONE = '0509999999';
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      mockService.create.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.SCHEDULED });
      await manager.bookForClient(adminDto);
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalledWith(appt1.phone, appt1.name, appt1.date, appt1.time, undefined);
      expect(mockMessaging.sendNewBookingAlert).not.toHaveBeenCalled();
      delete process.env.ADMIN_PHONE;
    });

    it('rejects an unavailable slot and creates nothing', async () => {
      mockAvailability(); // no availability
      await expect(manager.bookForClient(adminDto)).rejects.toThrow(BadRequestException);
      expect(mockClients.findOrCreate).not.toHaveBeenCalled();
      expect(mockService.create).not.toHaveBeenCalled();
    });
  });

  describe('getAvailability', () => {
    it('includes admin-opened extra slots and removes taken ones', async () => {
      mockAvailability({
        extras: [{ date: FUTURE_DATE, time: '20:00' }, { date: FUTURE_DATE, time: '21:00' }],
        taken: [{ date: FUTURE_DATE, time: '21:00' }],
      });
      const slots = await manager.getAvailability(FUTURE_DATE);
      expect(slots).toContain('20:00');
      expect(slots).not.toContain('21:00');
    });

    it('returns empty beyond the configurable booking horizon', async () => {
      mockAvailability({ extras: [{ date: BEYOND_HORIZON, time: '20:00' }] });
      const slots = await manager.getAvailability(BEYOND_HORIZON);
      expect(slots).toEqual([]);
    });

    it('honours a shortened horizon from clinic settings', async () => {
      // with a 5-day horizon, a slot a week out is no longer offered
      mockClinicSettings.getSettings.mockResolvedValueOnce({ bookingAheadDays: 5, reminderHour: clinicHourNow() });
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      const slots = await manager.getAvailability(FUTURE_DATE);
      expect(slots).toEqual([]);
    });

    it('fails closed (no availability) when there is no clinic-settings document', async () => {
      mockClinicSettings.getSettings.mockResolvedValueOnce(null);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      const slots = await manager.getAvailability(FUTURE_DATE);
      expect(slots).toEqual([]);
    });
  });

  describe('getAvailabilityRange', () => {
    it('rejects a malformed date', async () => {
      await expect(manager.getAvailabilityRange('not-a-date', FUTURE_DATE)).rejects.toThrow(BadRequestException);
    });

    it('rejects an inverted range', async () => {
      await expect(manager.getAvailabilityRange(addDays(clinicToday(), 10), clinicToday())).rejects.toThrow(BadRequestException);
    });

    it('returns a map keyed by date with the free slots', async () => {
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '20:00' }] });
      const map = await manager.getAvailabilityRange(FUTURE_DATE, FUTURE_DATE);
      expect(map[FUTURE_DATE]).toContain('20:00');
    });
  });

  describe('cancelOwn', () => {
    it('cancels the appointment when the phone matches', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      mockService.findById.mockResolvedValueOnce(appt1); // update() re-fetches existing
      mockService.update.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.CANCELLED });
      const result = await manager.cancelOwn('a1', '0501111111');
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('forbids cancelling someone else’s appointment', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      await expect(manager.cancelOwn('a1', '0509999999')).rejects.toThrow(ForbiddenException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('rescheduleOwn', () => {
    // appt1 is FUTURE_DATE (a week out) → comfortably outside the free window
    const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };

    it('moves to a new available slot, keeps the status, and confirms', async () => {
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      mockService.update.mockResolvedValueOnce({ ...scheduled, time: '21:00' });
      const result = await manager.rescheduleOwn('a1', '0501111111', FUTURE_DATE, '21:00');
      expect(mockService.update).toHaveBeenCalledWith('a1', { date: FUTURE_DATE, time: '21:00' });
      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalled();
    });

    it('forbids rescheduling someone else’s appointment', async () => {
      mockService.findById.mockResolvedValueOnce(scheduled);
      await expect(manager.rescheduleOwn('a1', '0509999999', FUTURE_DATE, '21:00')).rejects.toThrow(ForbiddenException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('does NOT auto-approve a client’s own pending request (stays pending)', async () => {
      const pending = { ...appt1, status: AppointmentStatus.PENDING };
      mockService.findById.mockResolvedValueOnce(pending);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      mockService.update.mockResolvedValueOnce({ ...pending, time: '21:00' });
      await manager.rescheduleOwn('a1', '0501111111', FUTURE_DATE, '21:00');
      expect(mockService.update).toHaveBeenCalledWith('a1', { date: FUTURE_DATE, time: '21:00' }); // no status promotion
    });

    it('rejects rescheduling inside the free window (<24h before)', async () => {
      const soon = { ...scheduled, date: clinicToday(), time: '23:59' };
      mockService.findById.mockResolvedValueOnce(soon);
      await expect(manager.rescheduleOwn('a1', '0501111111', FUTURE_DATE, '21:00')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('rejects when the new slot is not available', async () => {
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockAvailability(); // nothing free
      await expect(manager.rescheduleOwn('a1', '0501111111', FUTURE_DATE, '21:00')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('rejects rescheduling a cancelled appointment', async () => {
      mockService.findById.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.CANCELLED });
      await expect(manager.rescheduleOwn('a1', '0501111111', FUTURE_DATE, '21:00')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('rescheduleByAdmin', () => {
    const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };

    it('moves to a new available slot regardless of ownership and confirms', async () => {
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      mockService.update.mockResolvedValueOnce({ ...scheduled, time: '21:00' });
      const result = await manager.rescheduleByAdmin('a1', FUTURE_DATE, '21:00');
      expect(mockService.update).toHaveBeenCalledWith('a1', { date: FUTURE_DATE, time: '21:00' });
      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalled();
    });

    it('bypasses the free window (can move an appointment inside 24h)', async () => {
      const soon = { ...scheduled, date: clinicToday(), time: '23:59' };
      mockService.findById.mockResolvedValueOnce(soon);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      mockService.update.mockResolvedValueOnce({ ...soon, date: FUTURE_DATE, time: '21:00' });
      await manager.rescheduleByAdmin('a1', FUTURE_DATE, '21:00');
      expect(mockService.update).toHaveBeenCalledWith('a1', { date: FUTURE_DATE, time: '21:00' });
    });

    it('still rejects an unavailable (taken/blocked/past) slot', async () => {
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockAvailability(); // nothing free
      await expect(manager.rescheduleByAdmin('a1', FUTURE_DATE, '21:00')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('rejects rescheduling a cancelled appointment', async () => {
      mockService.findById.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.CANCELLED });
      await expect(manager.rescheduleByAdmin('a1', FUTURE_DATE, '21:00')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('auto-approves a still-pending request on admin reschedule (→ scheduled + confirmation)', async () => {
      const pending = { ...appt1, status: AppointmentStatus.PENDING };
      mockService.findById.mockResolvedValueOnce(pending);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      mockService.update.mockResolvedValueOnce({ ...pending, time: '21:00', status: AppointmentStatus.SCHEDULED });
      await manager.rescheduleByAdmin('a1', FUTURE_DATE, '21:00');
      expect(mockService.update).toHaveBeenCalledWith('a1', { date: FUTURE_DATE, time: '21:00', status: AppointmentStatus.SCHEDULED });
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('transitions a pending appointment to scheduled and sends a confirmation', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      mockService.update.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.SCHEDULED });
      const result = await manager.approve('a1');
      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalledWith(appt1.phone, appt1.name, appt1.date, appt1.time, undefined);
    });
  });

  describe('update', () => {
    it('does not re-send a confirmation when an already scheduled appointment is updated', async () => {
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockService.update.mockResolvedValueOnce(scheduled);
      await manager.update('a1', { status: AppointmentStatus.SCHEDULED });
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('terminal status guard', () => {
    for (const terminal of [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.REJECTED,
      AppointmentStatus.NOSHOW,
    ]) {
      it(`blocks a status change out of a ${terminal} appointment`, async () => {
        mockService.findById.mockResolvedValueOnce({ ...appt1, status: terminal });
        // target SCHEDULED — a genuine transition for every terminal status (re-activating a closed appt)
        await expect(manager.update('a1', { status: AppointmentStatus.SCHEDULED })).rejects.toThrow(BadRequestException);
        expect(mockService.update).not.toHaveBeenCalled();
      });
    }

    it('still allows a notes-only edit on a terminal appointment (no status change)', async () => {
      const completed = { ...appt1, status: AppointmentStatus.COMPLETED };
      mockService.findById.mockResolvedValueOnce(completed);
      mockService.update.mockResolvedValueOnce({ ...completed, notes: 'x' });
      await manager.update('a1', { notes: 'x' });
      expect(mockService.update).toHaveBeenCalledWith('a1', { notes: 'x' });
    });

    it('markNoShow on a terminal appointment is rejected', async () => {
      mockService.findById.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.CANCELLED });
      await expect(manager.markNoShow('a1')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });

    it('cancelOwn on a terminal appointment is rejected', async () => {
      mockService.findById.mockResolvedValue({ ...appt1, status: AppointmentStatus.REJECTED });
      await expect(manager.cancelOwn('a1', appt1.phone)).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('rejects a pending request → REJECTED and notifies the client', async () => {
      const pending = { ...appt1, status: AppointmentStatus.PENDING };
      mockService.findById.mockResolvedValueOnce(pending);
      mockService.update.mockResolvedValueOnce({ ...pending, status: AppointmentStatus.REJECTED });
      const result = await manager.reject('a1');
      expect(mockService.update).toHaveBeenCalledWith('a1', { status: AppointmentStatus.REJECTED });
      expect(result.status).toBe(AppointmentStatus.REJECTED);
      await flushVoidPromises();
      expect(mockMessaging.sendBookingRejected).toHaveBeenCalledWith(appt1.phone, appt1.name, appt1.date, appt1.time);
    });

    it('refuses to reject a non-pending (e.g. scheduled) appointment', async () => {
      mockService.findById.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.SCHEDULED });
      await expect(manager.reject('a1')).rejects.toThrow(BadRequestException);
      expect(mockService.update).not.toHaveBeenCalled();
    });
  });

  describe('markNoShow', () => {
    it('sets status to noshow', async () => {
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };
      const noshow = { ...appt1, status: AppointmentStatus.NOSHOW };
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockService.update.mockResolvedValueOnce(noshow);
      const result = await manager.markNoShow('a1');
      expect(mockService.update).toHaveBeenCalledWith('a1', { status: AppointmentStatus.NOSHOW });
      expect(result.status).toBe(AppointmentStatus.NOSHOW);
    });

    it('does not send a confirmation message when marking no-show', async () => {
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };
      const noshow = { ...appt1, status: AppointmentStatus.NOSHOW };
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockService.update.mockResolvedValueOnce(noshow);
      await manager.markNoShow('a1');
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('sendDailyReminders', () => {
    it('sends a reminder for each scheduled appointment and marks them sent', async () => {
      mockService.findScheduledForDate.mockResolvedValueOnce([appt1, appt2]);
      mockService.markReminderSent.mockResolvedValue(undefined);
      await manager.sendDailyReminders();
      expect(mockMessaging.sendAppointmentReminder).toHaveBeenCalledTimes(2);
      expect(mockService.markReminderSent).toHaveBeenCalledWith('a1');
      expect(mockService.markReminderSent).toHaveBeenCalledWith('a2');
    });

    it('does nothing when no appointments are scheduled', async () => {
      mockService.findScheduledForDate.mockResolvedValueOnce([]);
      await manager.sendDailyReminders();
      expect(mockMessaging.sendAppointmentReminder).not.toHaveBeenCalled();
    });

    it('does NOT mark an appointment as reminded when the send fails', async () => {
      mockService.findScheduledForDate.mockResolvedValueOnce([appt1]);
      mockMessaging.sendAppointmentReminder.mockResolvedValueOnce(false);
      await manager.sendDailyReminders();
      expect(mockService.markReminderSent).not.toHaveBeenCalled();
    });

    it('does nothing when the current hour is not the configured reminder hour', async () => {
      // hourly cron, but the configured send-hour is different → no-op this hour
      mockClinicSettings.getSettings.mockResolvedValueOnce({ bookingAheadDays: 183, reminderHour: (clinicHourNow() + 1) % 24 });
      await manager.sendDailyReminders();
      expect(mockService.findScheduledForDate).not.toHaveBeenCalled();
      expect(mockMessaging.sendAppointmentReminder).not.toHaveBeenCalled();
    });

    it('does nothing when there is no clinic-settings document (fail-closed)', async () => {
      mockClinicSettings.getSettings.mockResolvedValueOnce(null);
      await manager.sendDailyReminders();
      expect(mockService.findScheduledForDate).not.toHaveBeenCalled();
      expect(mockMessaging.sendAppointmentReminder).not.toHaveBeenCalled();
    });
  });

  describe('sendReminder (manual)', () => {
    it('sends and marks the appointment reminded on success', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      const result = await manager.sendReminder('a1');
      expect(mockMessaging.sendAppointmentReminder).toHaveBeenCalledWith(appt1.phone, appt1.time);
      expect(mockService.markReminderSent).toHaveBeenCalledWith('a1');
      expect(result).toMatchObject({ _id: 'a1' });
    });

    it('throws and does not mark when the send fails', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      mockMessaging.sendAppointmentReminder.mockResolvedValueOnce(false);
      await expect(manager.sendReminder('a1')).rejects.toThrow();
      expect(mockService.markReminderSent).not.toHaveBeenCalled();
    });
  });

  describe('autoCompletePastAppointments', () => {
    it('auto-completes past scheduled appointments and logs the count', async () => {
      mockService.autoCompleteScheduledBefore.mockResolvedValueOnce(3);
      await manager.autoCompletePastAppointments();
      expect(mockService.autoCompleteScheduledBefore).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    });

    it('does not log when there are no past scheduled appointments to complete', async () => {
      mockService.autoCompleteScheduledBefore.mockResolvedValueOnce(0);
      await manager.autoCompletePastAppointments();
      expect(mockService.autoCompleteScheduledBefore).toHaveBeenCalled();
    });
  });

  describe('getByPhone / getAll / remove', () => {
    it('returns appointments for a phone number', async () => {
      mockService.findByPhone.mockResolvedValueOnce([appt1]);
      const result = await manager.getByPhone('0501111111');
      expect(result).toHaveLength(1);
    });

    it('returns all appointments', async () => {
      mockService.findAll.mockResolvedValueOnce([appt1, appt2]);
      expect(await manager.getAll()).toHaveLength(2);
    });

    it('delegates delete to service', async () => {
      mockService.delete.mockResolvedValueOnce(undefined);
      await manager.remove('a1');
      expect(mockService.delete).toHaveBeenCalledWith('a1');
    });
  });

  describe('Google Calendar sync', () => {
    it('creates a calendar event when approve() transitions PENDING → SCHEDULED', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };
      mockService.update.mockResolvedValueOnce(scheduled);
      await manager.approve('a1');
      await flushVoidPromises();
      expect(mockCalendar.createEvent).toHaveBeenCalledWith(scheduled);
      expect(mockService.setCalendarEventId).toHaveBeenCalledWith('a1', 'evt-123');
    });

    it('creates a calendar event when bookForClient() creates a directly-scheduled appointment', async () => {
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: FUTURE_TIME }] });
      const scheduledAppt = { ...appt1, status: AppointmentStatus.SCHEDULED };
      mockService.create.mockResolvedValueOnce(scheduledAppt);
      await manager.bookForClient({ name: 'Alice', phone: '0501111111', date: FUTURE_DATE, time: FUTURE_TIME });
      await flushVoidPromises();
      expect(mockCalendar.createEvent).toHaveBeenCalledWith(scheduledAppt);
      expect(mockService.setCalendarEventId).toHaveBeenCalledWith('a1', 'evt-123');
    });

    it('deletes the calendar event when a SCHEDULED appointment is cancelled', async () => {
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED, googleCalendarEventId: 'evt-to-delete' };
      mockService.findById.mockResolvedValueOnce(scheduled);
      const cancelled = { ...scheduled, status: AppointmentStatus.CANCELLED };
      mockService.update.mockResolvedValueOnce(cancelled);
      await manager.update('a1', { status: AppointmentStatus.CANCELLED });
      await flushVoidPromises();
      expect(mockCalendar.deleteEvent).toHaveBeenCalledWith('evt-to-delete');
      expect(mockCalendar.createEvent).not.toHaveBeenCalled();
    });

    it('updates the calendar event when rescheduleOwn() moves a SCHEDULED appointment', async () => {
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED, googleCalendarEventId: 'evt-upd' };
      mockService.findById.mockResolvedValueOnce(scheduled);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      const rescheduled = { ...scheduled, time: '21:00' };
      mockService.update.mockResolvedValueOnce(rescheduled);
      await manager.rescheduleOwn('a1', '0501111111', FUTURE_DATE, '21:00');
      await flushVoidPromises();
      expect(mockCalendar.updateEvent).toHaveBeenCalledWith('evt-upd', rescheduled);
    });

    it('creates a new event (not updates) when rescheduleByAdmin() promotes a PENDING appointment', async () => {
      const pending = { ...appt1, status: AppointmentStatus.PENDING };
      mockService.findById.mockResolvedValueOnce(pending);
      mockAvailability({ extras: [{ date: FUTURE_DATE, time: '21:00' }] });
      const promoted = { ...pending, time: '21:00', status: AppointmentStatus.SCHEDULED };
      mockService.update.mockResolvedValueOnce(promoted);
      await manager.rescheduleByAdmin('a1', FUTURE_DATE, '21:00');
      await flushVoidPromises();
      expect(mockCalendar.updateEvent).not.toHaveBeenCalled();
      expect(mockCalendar.createEvent).toHaveBeenCalledWith(promoted);
    });

    it('does not delete the calendar event when cancelling a PENDING appointment (no event existed)', async () => {
      const pending = { ...appt1, status: AppointmentStatus.PENDING };
      mockService.findById.mockResolvedValueOnce(pending);
      const cancelled = { ...pending, status: AppointmentStatus.CANCELLED };
      mockService.update.mockResolvedValueOnce(cancelled);
      await manager.update('a1', { status: AppointmentStatus.CANCELLED });
      await flushVoidPromises();
      expect(mockCalendar.deleteEvent).not.toHaveBeenCalled();
    });

    it('does not surface calendar errors to the caller (calendar sync is non-critical)', async () => {
      mockCalendar.createEvent.mockRejectedValueOnce(new Error('calendar down'));
      mockService.findById.mockResolvedValueOnce(appt1);
      const scheduled = { ...appt1, status: AppointmentStatus.SCHEDULED };
      mockService.update.mockResolvedValueOnce(scheduled);
      await expect(manager.approve('a1')).resolves.not.toThrow();
    });
  });
});
