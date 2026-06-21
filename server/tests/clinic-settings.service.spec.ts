import { Test, TestingModule } from '@nestjs/testing';
import { ClinicSettingsService } from '../src/clinic-settings/clinic-settings.service';
import { ClinicSettingsDao } from '../src/clinic-settings/clinic-settings.dao';

const mockDao = { get: jest.fn(), upsert: jest.fn() };

describe('ClinicSettingsService', () => {
  let service: ClinicSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinicSettingsService, { provide: ClinicSettingsDao, useValue: mockDao }],
    }).compile();
    service = module.get(ClinicSettingsService);
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns the stored document', async () => {
      mockDao.get.mockResolvedValueOnce({ bookingAheadDays: 90, reminderHour: 8 });
      expect(await service.getSettings()).toEqual({ bookingAheadDays: 90, reminderHour: 8 });
    });

    it('returns null when no document exists (no hardcoded fallback)', async () => {
      mockDao.get.mockResolvedValueOnce(null);
      expect(await service.getSettings()).toBeNull();
      expect(mockDao.upsert).not.toHaveBeenCalled(); // the app never seeds
    });
  });

  describe('update', () => {
    it('merges a partial patch over the current settings and persists it', async () => {
      mockDao.get.mockResolvedValueOnce({ bookingAheadDays: 183, reminderHour: 9 });
      mockDao.upsert.mockResolvedValueOnce({ bookingAheadDays: 183, reminderHour: 7 });
      const result = await service.update({ reminderHour: 7 });
      expect(mockDao.upsert).toHaveBeenCalledWith({ bookingAheadDays: 183, reminderHour: 7 });
      expect(result.reminderHour).toBe(7);
    });
  });
});
