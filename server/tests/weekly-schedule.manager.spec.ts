import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WeeklyScheduleManager } from '../src/weekly-schedule/weekly-schedule.manager';
import { WeeklyScheduleService } from '../src/weekly-schedule/weekly-schedule.service';
import { Weekday } from '../src/common/enums/weekday.enum';
import { oneAppointmentAfter, justInsideWindow } from './helpers/time';

const mockService = { getSchedule: jest.fn(), setDay: jest.fn() };

describe('WeeklyScheduleManager', () => {
  let manager: WeeklyScheduleManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklyScheduleManager, { provide: WeeklyScheduleService, useValue: mockService }],
    }).compile();
    manager = module.get<WeeklyScheduleManager>(WeeklyScheduleManager);
    jest.clearAllMocks();
  });

  describe('updateDay', () => {
    it('rejects times less than one appointment apart', async () => {
      await expect(manager.updateDay(Weekday.MONDAY, ['18:00', '18:15'])).rejects.toThrow(BadRequestException);
      expect(mockService.setDay).not.toHaveBeenCalled();
    });

    it('rejects times one minute inside the window', async () => {
      await expect(manager.updateDay(Weekday.MONDAY, ['18:00', justInsideWindow('18:00')])).rejects.toThrow(BadRequestException);
      expect(mockService.setDay).not.toHaveBeenCalled();
    });

    it('accepts times exactly one appointment apart', async () => {
      const spaced = ['18:00', oneAppointmentAfter('18:00')];
      mockService.setDay.mockResolvedValueOnce({});
      await manager.updateDay(Weekday.MONDAY, spaced);
      expect(mockService.setDay).toHaveBeenCalledWith(Weekday.MONDAY, spaced);
    });

    it('rejects an unsorted list with a too-close pair', async () => {
      await expect(manager.updateDay(Weekday.MONDAY, ['18:15', '09:00', '18:00'])).rejects.toThrow(BadRequestException);
      expect(mockService.setDay).not.toHaveBeenCalled();
    });

    it('accepts an empty list (closing a day)', async () => {
      mockService.setDay.mockResolvedValueOnce({});
      await manager.updateDay(Weekday.SUNDAY, []);
      expect(mockService.setDay).toHaveBeenCalledWith(Weekday.SUNDAY, []);
    });
  });
});
