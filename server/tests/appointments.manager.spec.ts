import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AppointmentsManager } from '../src/appointments/appointments.manager';
import { AppointmentsService } from '../src/appointments/appointments.service';
import { ScheduleBlocksManager } from '../src/schedule-blocks/schedule-blocks.manager';
import { WeeklyScheduleManager } from '../src/weekly-schedule/weekly-schedule.manager';
import { MESSAGING_PROVIDER } from '../src/integrations/messaging/messaging.token';
import { AppointmentStatus } from '../src/common/enums/appointment-status.enum';
import { CreateAppointmentDto } from '../src/appointments/dto/create-appointment.dto';
import { clinicToday, addDays } from '../src/common/utils/date.utils';

// a date a week out — within the booking horizon, not in the past. Availability
// for it is driven via mocked extra slots so the test is weekday-independent.
const FUTURE_DATE = addDays(clinicToday(), 7);
const FUTURE_TIME = '20:00'; // never part of the base schedule → must come from an extra
const BEYOND_HORIZON = addDays(clinicToday(), 60);
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
  update: jest.fn(),
  delete: jest.fn(),
};

const mockMessaging = {
  sendBookingRequestReceived: jest.fn().mockResolvedValue(undefined),
  sendBookingConfirmation: jest.fn().mockResolvedValue(undefined),
  sendAppointmentReminder: jest.fn().mockResolvedValue(undefined),
  sendNewBookingAlert: jest.fn().mockResolvedValue(undefined),
};

const mockScheduleBlocks = {
  getBlocksForDate: jest.fn(),
  getBlocksInRange: jest.fn(),
  getExtraSlotsInRange: jest.fn(),
};

// empty base schedule by default — booking tests drive availability via extra slots
const EMPTY_SCHEDULE = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
const mockWeeklySchedule = { getSchedule: jest.fn().mockResolvedValue(EMPTY_SCHEDULE) };

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
        { provide: MESSAGING_PROVIDER, useValue: mockMessaging },
      ],
    }).compile();
    manager = module.get<AppointmentsManager>(AppointmentsManager);
    jest.clearAllMocks();
    mockWeeklySchedule.getSchedule.mockResolvedValue(EMPTY_SCHEDULE);
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

    it('returns empty beyond the booking horizon (~1 month)', async () => {
      mockAvailability({ extras: [{ date: BEYOND_HORIZON, time: '20:00' }] });
      const slots = await manager.getAvailability(BEYOND_HORIZON);
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

  describe('approve', () => {
    it('transitions a pending appointment to scheduled and sends a confirmation', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      mockService.update.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.SCHEDULED });
      const result = await manager.approve('a1');
      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
      await flushVoidPromises();
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalledWith(appt1.phone, appt1.name, appt1.date, appt1.time);
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
});
