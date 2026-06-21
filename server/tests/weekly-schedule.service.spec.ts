import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WeeklyScheduleService } from '../src/weekly-schedule/weekly-schedule.service';
import { WeeklyScheduleDao } from '../src/weekly-schedule/weekly-schedule.dao';
import { Weekday } from '../src/common/enums/weekday.enum';

const mockDao = { findAll: jest.fn(), upsert: jest.fn() };

describe('WeeklyScheduleService', () => {
  let service: WeeklyScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklyScheduleService, { provide: WeeklyScheduleDao, useValue: mockDao }],
    }).compile();
    service = module.get(WeeklyScheduleService);
    jest.clearAllMocks();
  });

  describe('getSchedule', () => {
    it('returns every day closed (empty) when the DB has no rows', async () => {
      mockDao.findAll.mockResolvedValueOnce([]);
      const schedule = await service.getSchedule();
      for (let wd = 0; wd <= 6; wd++) {
        expect(schedule[wd as Weekday]).toEqual([]);
      }
    });

    it('sources each day entirely from the DB', async () => {
      mockDao.findAll.mockResolvedValueOnce([
        { weekday: Weekday.SUNDAY, times: ['10:00', '11:00'] },
        { weekday: Weekday.MONDAY, times: ['09:00'] },
      ]);
      const schedule = await service.getSchedule();
      expect(schedule[Weekday.SUNDAY]).toEqual(['10:00', '11:00']);
      expect(schedule[Weekday.MONDAY]).toEqual(['09:00']);
      expect(schedule[Weekday.TUESDAY]).toEqual([]); // no row → closed
    });
  });

  describe('setDay', () => {
    it('normalises (sorts + de-dups) and upserts the day', async () => {
      mockDao.upsert.mockResolvedValueOnce({});
      mockDao.findAll.mockResolvedValueOnce([]);
      await service.setDay(Weekday.MONDAY, ['11:00', '09:00', '11:00']);
      expect(mockDao.upsert).toHaveBeenCalledWith(Weekday.MONDAY, ['09:00', '11:00']);
    });

    it('rejects an out-of-range weekday', async () => {
      await expect(service.setDay(9, ['09:00'])).rejects.toThrow(BadRequestException);
      expect(mockDao.upsert).not.toHaveBeenCalled();
    });

    it('rejects a malformed time', async () => {
      await expect(service.setDay(Weekday.MONDAY, ['9am'])).rejects.toThrow(BadRequestException);
      expect(mockDao.upsert).not.toHaveBeenCalled();
    });

    it('accepts an empty list (closing a day)', async () => {
      mockDao.upsert.mockResolvedValueOnce({});
      mockDao.findAll.mockResolvedValueOnce([]);
      await service.setDay(Weekday.SUNDAY, []);
      expect(mockDao.upsert).toHaveBeenCalledWith(Weekday.SUNDAY, []);
    });
  });
});
