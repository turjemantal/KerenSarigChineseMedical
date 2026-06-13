import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ScheduleBlocksManager } from '../src/schedule-blocks/schedule-blocks.manager';
import { ScheduleBlocksService } from '../src/schedule-blocks/schedule-blocks.service';
import { ExtraSlotsService } from '../src/schedule-blocks/extra-slots.service';
import { createScheduleBlockSchema } from '../src/schedule-blocks/dto/validations/schedule-block.schemas';

const dayBlock = { _id: 'b1', startDate: '2026-07-01', endDate: '2026-07-01', reason: 'השתלמות' };
const hoursBlock = { _id: 'b2', startDate: '2026-07-02', endDate: '2026-07-02', startTime: '09:00', endTime: '13:00', reason: 'סידורים' };
const vacationBlock = { _id: 'b3', startDate: '2026-08-10', endDate: '2026-08-20', reason: 'חופשה' };

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findInRange: jest.fn(),
  delete: jest.fn(),
};

const mockExtraSlots = {
  create: jest.fn(),
  findAll: jest.fn(),
  findInRange: jest.fn(),
  delete: jest.fn(),
};

describe('ScheduleBlocksManager', () => {
  let manager: ScheduleBlocksManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleBlocksManager,
        { provide: ScheduleBlocksService, useValue: mockService },
        { provide: ExtraSlotsService, useValue: mockExtraSlots },
      ],
    }).compile();
    manager = module.get<ScheduleBlocksManager>(ScheduleBlocksManager);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('defaults endDate to startDate for a single-day block', async () => {
      mockService.create.mockResolvedValueOnce(dayBlock);
      await manager.create({ startDate: '2026-07-01', reason: 'השתלמות' });
      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: '2026-07-01', endDate: '2026-07-01' }),
      );
    });

    it('keeps an explicit endDate for a vacation range', async () => {
      mockService.create.mockResolvedValueOnce(vacationBlock);
      await manager.create({ startDate: '2026-08-10', endDate: '2026-08-20', reason: 'חופשה' });
      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: '2026-08-10', endDate: '2026-08-20' }),
      );
    });

    it('rejects endDate before startDate', async () => {
      await expect(manager.create({ startDate: '2026-08-20', endDate: '2026-08-10' }))
        .rejects.toThrow(BadRequestException);
      expect(mockService.create).not.toHaveBeenCalled();
    });

    it('rejects endTime before or equal to startTime', async () => {
      await expect(manager.create({ startDate: '2026-07-02', startTime: '13:00', endTime: '09:00' }))
        .rejects.toThrow(BadRequestException);
      await expect(manager.create({ startDate: '2026-07-02', startTime: '09:00', endTime: '09:00' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getPublicInRange', () => {
    it('rejects an inverted range (to before from)', async () => {
      await expect(manager.getPublicInRange('2026-07-31', '2026-07-01'))
        .rejects.toThrow(BadRequestException);
      expect(mockService.findInRange).not.toHaveBeenCalled();
    });

    it('rejects an oversized range (over a year)', async () => {
      await expect(manager.getPublicInRange('2026-01-01', '2028-01-01'))
        .rejects.toThrow(BadRequestException);
      expect(mockService.findInRange).not.toHaveBeenCalled();
    });

    it('strips internal reasons from public blocks', async () => {
      mockService.findInRange.mockResolvedValueOnce([dayBlock, hoursBlock]);
      const result = await manager.getPublicInRange('2026-07-01', '2026-07-31');
      expect(result).toEqual([
        { startDate: '2026-07-01', endDate: '2026-07-01', startTime: undefined, endTime: undefined },
        { startDate: '2026-07-02', endDate: '2026-07-02', startTime: '09:00', endTime: '13:00' },
      ]);
      expect(result.every(b => !('reason' in b && b['reason']))).toBe(true);
    });
  });

  describe('getBlocksForDate', () => {
    it('queries the single-day range', async () => {
      mockService.findInRange.mockResolvedValueOnce([dayBlock]);
      await manager.getBlocksForDate('2026-07-01');
      expect(mockService.findInRange).toHaveBeenCalledWith('2026-07-01', '2026-07-01');
    });
  });

  describe('remove', () => {
    it('delegates delete to service', async () => {
      mockService.delete.mockResolvedValueOnce(undefined);
      await manager.remove('b1');
      expect(mockService.delete).toHaveBeenCalledWith('b1');
    });
  });
});

describe('createScheduleBlockSchema', () => {
  it('accepts a full-day block', () => {
    const { error } = createScheduleBlockSchema.validate({ startDate: '2026-07-01' });
    expect(error).toBeUndefined();
  });

  it('accepts an hour-range block', () => {
    const { error } = createScheduleBlockSchema.validate({
      startDate: '2026-07-01', startTime: '09:00', endTime: '13:00', reason: 'סידורים',
    });
    expect(error).toBeUndefined();
  });

  it('accepts a vacation range', () => {
    const { error } = createScheduleBlockSchema.validate({
      startDate: '2026-08-10', endDate: '2026-08-20', reason: 'חופשה',
    });
    expect(error).toBeUndefined();
  });

  it('rejects a malformed date', () => {
    const { error } = createScheduleBlockSchema.validate({ startDate: '01/07/2026' });
    expect(error).toBeDefined();
  });

  it('rejects a malformed time', () => {
    const { error } = createScheduleBlockSchema.validate({
      startDate: '2026-07-01', startTime: '9am', endTime: '13:00',
    });
    expect(error).toBeDefined();
  });

  it('rejects startTime without endTime', () => {
    const { error } = createScheduleBlockSchema.validate({ startDate: '2026-07-01', startTime: '09:00' });
    expect(error).toBeDefined();
  });

  it('rejects a missing startDate', () => {
    const { error } = createScheduleBlockSchema.validate({ endDate: '2026-07-01' });
    expect(error).toBeDefined();
  });
});
