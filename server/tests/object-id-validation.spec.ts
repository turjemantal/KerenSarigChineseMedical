import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AppointmentsService } from '../src/appointments/appointments.service';
import { AppointmentsDao } from '../src/appointments/appointments.dao';
import { LeadsService } from '../src/leads/leads.service';
import { LeadsDao } from '../src/leads/leads.dao';
import { ScheduleBlocksService } from '../src/schedule-blocks/schedule-blocks.service';
import { ScheduleBlocksDao } from '../src/schedule-blocks/schedule-blocks.dao';

// Malformed Mongo ids must return a clean 404 — never reach the DAO (CastError → 500).
const MALFORMED_ID = 'not-a-valid-object-id';

describe('ObjectId validation', () => {
  describe('AppointmentsService', () => {
    let service: AppointmentsService;
    const mockDao = { findById: jest.fn(), update: jest.fn(), delete: jest.fn() };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [AppointmentsService, { provide: AppointmentsDao, useValue: mockDao }],
      }).compile();
      service = module.get(AppointmentsService);
      jest.clearAllMocks();
    });

    it.each(['findById', 'update', 'delete'] as const)(
      '%s throws NotFound for a malformed id without hitting the DAO',
      async method => {
        await expect(
          method === 'update' ? service.update(MALFORMED_ID, {}) : service[method](MALFORMED_ID),
        ).rejects.toThrow(NotFoundException);
        expect(mockDao[method]).not.toHaveBeenCalled();
      },
    );
  });

  describe('LeadsService', () => {
    let service: LeadsService;
    const mockDao = { findById: jest.fn(), update: jest.fn(), delete: jest.fn() };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [LeadsService, { provide: LeadsDao, useValue: mockDao }],
      }).compile();
      service = module.get(LeadsService);
      jest.clearAllMocks();
    });

    it.each(['findById', 'update', 'delete'] as const)(
      '%s throws NotFound for a malformed id without hitting the DAO',
      async method => {
        await expect(
          method === 'update' ? service.update(MALFORMED_ID, {}) : service[method](MALFORMED_ID),
        ).rejects.toThrow(NotFoundException);
        expect(mockDao[method]).not.toHaveBeenCalled();
      },
    );
  });

  describe('ScheduleBlocksService', () => {
    let service: ScheduleBlocksService;
    const mockDao = { delete: jest.fn() };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ScheduleBlocksService, { provide: ScheduleBlocksDao, useValue: mockDao }],
      }).compile();
      service = module.get(ScheduleBlocksService);
      jest.clearAllMocks();
    });

    it('delete throws NotFound for a malformed id without hitting the DAO', async () => {
      await expect(service.delete(MALFORMED_ID)).rejects.toThrow(NotFoundException);
      expect(mockDao.delete).not.toHaveBeenCalled();
    });
  });
});
