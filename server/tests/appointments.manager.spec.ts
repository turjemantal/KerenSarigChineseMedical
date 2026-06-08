import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsManager } from '../src/appointments/appointments.manager';
import { AppointmentsService } from '../src/appointments/appointments.service';
import { MESSAGING_PROVIDER } from '../src/integrations/messaging/messaging.token';
import { AppointmentStatus } from '../src/common/enums/appointment-status.enum';
import { CreateAppointmentDto } from '../src/appointments/dto/create-appointment.dto';

const appt1 = { _id: 'a1', phone: '0501111111', name: 'Alice', date: '2026-05-01', time: '09:00', status: 'pending' };
const appt2 = { _id: 'a2', phone: '0502222222', name: 'Bob', date: '2026-05-01', time: '10:30', status: 'pending' };


const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByDate: jest.fn(),
  findByPhone: jest.fn(),
  findById: jest.fn(),
  findScheduledForDate: jest.fn(),
  markReminderSent: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockMessaging = {
  sendBookingConfirmation: jest.fn().mockResolvedValue(undefined),
  sendAppointmentReminder: jest.fn().mockResolvedValue(undefined),
};

describe('AppointmentsManager', () => {
  let manager: AppointmentsManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsManager,
        { provide: AppointmentsService, useValue: mockService },
        { provide: MESSAGING_PROVIDER, useValue: mockMessaging },
      ],
    }).compile();
    manager = module.get<AppointmentsManager>(AppointmentsManager);
    jest.clearAllMocks();
  });

  describe('book', () => {
    it('creates and returns a new appointment', async () => {
      mockService.create.mockResolvedValueOnce(appt1);
      const dto: CreateAppointmentDto = { phone: '0501111111', name: 'Alice', date: '2026-05-01', time: '09:00' };
      const result = await manager.book(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({ _id: 'a1', status: 'pending' });
    });

    it('passes all optional fields through to service', async () => {
      const dto: CreateAppointmentDto = { phone: '0501111111', name: 'Alice', date: '2026-05-01', time: '09:00', concern: 'כאב גב', notes: 'ללא גלוטן' };
      mockService.create.mockResolvedValueOnce({ ...appt1, concern: 'כאב גב' });
      await manager.book(dto);
      expect(mockService.create).toHaveBeenCalledWith(expect.objectContaining({ concern: 'כאב גב', notes: 'ללא גלוטן' }));
    });

    it('sends a booking confirmation via messaging service', async () => {
      mockService.create.mockResolvedValueOnce(appt1);
      const dto: CreateAppointmentDto = { phone: '0501111111', name: 'Alice', date: '2026-05-01', time: '09:00' };
      await manager.book(dto);
      await new Promise(r => setTimeout(r, 0)); // flush void promise
      expect(mockMessaging.sendBookingConfirmation).toHaveBeenCalledWith(
        appt1.phone, appt1.name, appt1.date, appt1.time,
      );
    });
  });

  describe('sendDailyReminders', () => {
    it('sends a reminder for each scheduled appointment', async () => {
      mockService.findScheduledForDate.mockResolvedValueOnce([appt1, appt2]);
      mockService.markReminderSent.mockResolvedValue(undefined);

      await manager.sendDailyReminders();

      expect(mockMessaging.sendAppointmentReminder).toHaveBeenCalledTimes(2);
      expect(mockMessaging.sendAppointmentReminder).toHaveBeenCalledWith(appt1.phone, appt1.time);
      expect(mockMessaging.sendAppointmentReminder).toHaveBeenCalledWith(appt2.phone, appt2.time);
    });

    it('marks each appointment as reminder sent', async () => {
      mockService.findScheduledForDate.mockResolvedValueOnce([appt1, appt2]);
      mockService.markReminderSent.mockResolvedValue(undefined);

      await manager.sendDailyReminders();

      expect(mockService.markReminderSent).toHaveBeenCalledTimes(2);
      expect(mockService.markReminderSent).toHaveBeenCalledWith('a1');
      expect(mockService.markReminderSent).toHaveBeenCalledWith('a2');
    });

    it('does nothing when no appointments are scheduled', async () => {
      mockService.findScheduledForDate.mockResolvedValueOnce([]);

      await manager.sendDailyReminders();

      expect(mockMessaging.sendAppointmentReminder).not.toHaveBeenCalled();
      expect(mockService.markReminderSent).not.toHaveBeenCalled();
    });
  });

  describe('getAvailability', () => {
    it('returns booked time strings for a date', async () => {
      mockService.findByDate.mockResolvedValueOnce([appt1, appt2]);
      const times = await manager.getAvailability('2026-05-01');
      expect(times).toEqual(['09:00', '10:30']);
    });

    it('returns empty array when no appointments', async () => {
      mockService.findByDate.mockResolvedValueOnce([]);
      const times = await manager.getAvailability('2026-05-02');
      expect(times).toEqual([]);
    });

    it('only includes time field from each appointment', async () => {
      mockService.findByDate.mockResolvedValueOnce([appt1]);
      const times = await manager.getAvailability('2026-05-01');
      expect(times).toHaveLength(1);
      expect(typeof times[0]).toBe('string');
    });
  });

  describe('getByPhone', () => {
    it('returns appointments for a phone number', async () => {
      mockService.findByPhone.mockResolvedValueOnce([appt1]);
      const result = await manager.getByPhone('0501111111');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ phone: '0501111111' });
    });

    it('returns empty array when no appointments for phone', async () => {
      mockService.findByPhone.mockResolvedValueOnce([]);
      const result = await manager.getByPhone('0509999999');
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns a single appointment by id', async () => {
      mockService.findById.mockResolvedValueOnce(appt1);
      const result = await manager.getById('a1');
      expect(result).toMatchObject({ _id: 'a1' });
    });
  });

  describe('update', () => {
    it('cancels an appointment', async () => {
      mockService.update.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.CANCELLED });
      const result = await manager.update('a1', { status: AppointmentStatus.CANCELLED });
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(mockService.update).toHaveBeenCalledWith('a1', { status: AppointmentStatus.CANCELLED });
    });

    it('approves a pending appointment (pending → scheduled)', async () => {
      mockService.update.mockResolvedValueOnce({ ...appt1, status: AppointmentStatus.SCHEDULED });
      const result = await manager.update('a1', { status: AppointmentStatus.SCHEDULED });
      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
    });

    it('updates notes on an appointment', async () => {
      const withNotes = { ...appt1, notes: 'הערה חדשה' };
      mockService.update.mockResolvedValueOnce(withNotes);
      const result = await manager.update('a1', { notes: 'הערה חדשה' });
      expect(result.notes).toBe('הערה חדשה');
    });
  });

  describe('getAll', () => {
    it('returns all appointments', async () => {
      mockService.findAll.mockResolvedValueOnce([appt1, appt2]);
      const result = await manager.getAll();
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no appointments exist', async () => {
      mockService.findAll.mockResolvedValueOnce([]);
      const result = await manager.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('delegates delete to service', async () => {
      mockService.delete.mockResolvedValueOnce(undefined);
      await manager.remove('a1');
      expect(mockService.delete).toHaveBeenCalledWith('a1');
    });
  });
});
