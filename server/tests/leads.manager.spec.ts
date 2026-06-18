import { Test, TestingModule } from '@nestjs/testing';
import { LeadsManager } from '../src/leads/leads.manager';
import { LeadsService } from '../src/leads/leads.service';
import { MESSAGING_PROVIDER } from '../src/integrations/messaging/messaging.token';
import { CreateLeadDto } from '../src/leads/dto/create-lead.dto';
import { UpdateLeadDto } from '../src/leads/dto/update-lead.dto';

const lead1 = { _id: 'l1', name: 'Alice', phone: '0501111111', concern: 'כאב גב', status: 'new' };
const lead2 = { _id: 'l2', name: 'Bob',   phone: '0502222222', concern: 'מעקב',   status: 'contacted' };

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockMessaging = {
  sendNewLeadAlert: jest.fn().mockResolvedValue(undefined),
};

const flushVoidPromises = () => new Promise(r => setTimeout(r, 0));

describe('LeadsManager', () => {
  let manager: LeadsManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsManager,
        { provide: LeadsService, useValue: mockService },
        { provide: MESSAGING_PROVIDER, useValue: mockMessaging },
      ],
    }).compile();
    manager = module.get<LeadsManager>(LeadsManager);
    jest.clearAllMocks();
  });

  describe('submitLead', () => {
    it('creates and returns the new lead', async () => {
      mockService.create.mockResolvedValueOnce(lead1);
      const dto: CreateLeadDto = { name: 'Alice', phone: '0501111111', concern: 'כאב גב' };
      const result = await manager.submitLead(dto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toMatchObject({ _id: 'l1', name: 'Alice' });
    });

    it('passes optional fields to service', async () => {
      const dto: CreateLeadDto = { name: 'Alice', phone: '0501111111', concern: 'כאב גב', email: 'alice@example.com', notes: 'הערה' };
      mockService.create.mockResolvedValueOnce({ ...lead1, email: 'alice@example.com' });
      await manager.submitLead(dto);
      expect(mockService.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'alice@example.com', notes: 'הערה' }));
    });

    it('alerts the clinic owner about the new lead when ADMIN_PHONE is set', async () => {
      process.env.ADMIN_PHONE = '0509999999';
      mockService.create.mockResolvedValueOnce(lead1);
      await manager.submitLead({ name: 'Alice', phone: '0501111111', concern: 'כאב גב' });
      await flushVoidPromises();
      expect(mockMessaging.sendNewLeadAlert).toHaveBeenCalledWith('0509999999', lead1.name, lead1.phone, lead1.concern);
      delete process.env.ADMIN_PHONE;
    });

    it('skips the lead alert when ADMIN_PHONE is not set', async () => {
      delete process.env.ADMIN_PHONE;
      mockService.create.mockResolvedValueOnce(lead1);
      await manager.submitLead({ name: 'Alice', phone: '0501111111', concern: 'כאב גב' });
      await flushVoidPromises();
      expect(mockMessaging.sendNewLeadAlert).not.toHaveBeenCalled();
    });

    it('still returns the lead even if the alert fails', async () => {
      process.env.ADMIN_PHONE = '0509999999';
      mockService.create.mockResolvedValueOnce(lead1);
      mockMessaging.sendNewLeadAlert.mockRejectedValueOnce(new Error('sms down'));
      const result = await manager.submitLead({ name: 'Alice', phone: '0501111111', concern: 'כאב גב' });
      await flushVoidPromises();
      expect(result).toMatchObject({ _id: 'l1' });
      delete process.env.ADMIN_PHONE;
    });
  });

  describe('getAll', () => {
    it('returns all leads', async () => {
      mockService.findAll.mockResolvedValueOnce([lead1, lead2]);
      const result = await manager.getAll();
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no leads', async () => {
      mockService.findAll.mockResolvedValueOnce([]);
      const result = await manager.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns a lead by id', async () => {
      mockService.findById.mockResolvedValueOnce(lead1);
      const result = await manager.getById('l1');
      expect(result).toMatchObject({ _id: 'l1', name: 'Alice' });
    });
  });

  describe('updateStatus', () => {
    it('updates status from new to contacted', async () => {
      const updated = { ...lead1, status: 'contacted' };
      mockService.update.mockResolvedValueOnce(updated);
      const result = await manager.updateStatus('l1', { status: 'contacted' } as UpdateLeadDto);
      expect(result.status).toBe('contacted');
      expect(mockService.update).toHaveBeenCalledWith('l1', { status: 'contacted' });
    });

    it('updates status to booked', async () => {
      mockService.update.mockResolvedValueOnce({ ...lead1, status: 'booked' });
      const result = await manager.updateStatus('l1', { status: 'booked' } as UpdateLeadDto);
      expect(result.status).toBe('booked');
    });

    it('updates notes on a lead', async () => {
      mockService.update.mockResolvedValueOnce({ ...lead1, notes: 'תיאום בוצע' });
      const result = await manager.updateStatus('l1', { notes: 'תיאום בוצע' } as UpdateLeadDto);
      expect(result.notes).toBe('תיאום בוצע');
    });
  });

  describe('remove', () => {
    it('delegates delete to service', async () => {
      mockService.delete.mockResolvedValueOnce(undefined);
      await manager.remove('l1');
      expect(mockService.delete).toHaveBeenCalledWith('l1');
    });
  });
});
