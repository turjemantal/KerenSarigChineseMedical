import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ExtraSlotsService } from '../src/schedule-blocks/extra-slots.service';
import { ExtraSlotsDao } from '../src/schedule-blocks/extra-slots.dao';

const mockDao = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByDate: jest.fn(),
  findInRange: jest.fn(),
  delete: jest.fn(),
};

describe('ExtraSlotsService', () => {
  let service: ExtraSlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtraSlotsService, { provide: ExtraSlotsDao, useValue: mockDao }],
    }).compile();
    service = module.get(ExtraSlotsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates an extra slot', async () => {
      mockDao.create.mockResolvedValueOnce({ _id: 'e1', date: '2026-07-01', time: '20:00' });
      const result = await service.create('2026-07-01', '20:00');
      expect(result).toMatchObject({ time: '20:00' });
    });

    it('throws Conflict when the slot already exists (duplicate index)', async () => {
      mockDao.create.mockRejectedValueOnce({ code: 11000 });
      await expect(service.create('2026-07-01', '20:00')).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('throws NotFound for a malformed id without hitting the DAO', async () => {
      await expect(service.delete('not-an-id')).rejects.toThrow(NotFoundException);
      expect(mockDao.delete).not.toHaveBeenCalled();
    });

    it('throws NotFound when nothing was deleted', async () => {
      mockDao.delete.mockResolvedValueOnce(null);
      await expect(service.delete('6a2c0f129979bf0a6b94250f')).rejects.toThrow(NotFoundException);
    });
  });
});
