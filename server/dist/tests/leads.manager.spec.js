"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const leads_manager_1 = require("../src/leads/leads.manager");
const leads_service_1 = require("../src/leads/leads.service");
const lead1 = { _id: 'l1', name: 'Alice', phone: '0501111111', concern: 'כאב גב', status: 'new' };
const lead2 = { _id: 'l2', name: 'Bob', phone: '0502222222', concern: 'מעקב', status: 'contacted' };
const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};
describe('LeadsManager', () => {
    let manager;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                leads_manager_1.LeadsManager,
                { provide: leads_service_1.LeadsService, useValue: mockService },
            ],
        }).compile();
        manager = module.get(leads_manager_1.LeadsManager);
        jest.clearAllMocks();
    });
    describe('submitLead', () => {
        it('creates and returns the new lead', async () => {
            mockService.create.mockResolvedValueOnce(lead1);
            const dto = { name: 'Alice', phone: '0501111111', concern: 'כאב גב' };
            const result = await manager.submitLead(dto);
            expect(mockService.create).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject({ _id: 'l1', name: 'Alice' });
        });
        it('passes optional fields to service', async () => {
            const dto = { name: 'Alice', phone: '0501111111', concern: 'כאב גב', email: 'alice@example.com', notes: 'הערה' };
            mockService.create.mockResolvedValueOnce({ ...lead1, email: 'alice@example.com' });
            await manager.submitLead(dto);
            expect(mockService.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'alice@example.com', notes: 'הערה' }));
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
            const result = await manager.updateStatus('l1', { status: 'contacted' });
            expect(result.status).toBe('contacted');
            expect(mockService.update).toHaveBeenCalledWith('l1', { status: 'contacted' });
        });
        it('updates status to booked', async () => {
            mockService.update.mockResolvedValueOnce({ ...lead1, status: 'booked' });
            const result = await manager.updateStatus('l1', { status: 'booked' });
            expect(result.status).toBe('booked');
        });
        it('updates notes on a lead', async () => {
            mockService.update.mockResolvedValueOnce({ ...lead1, notes: 'תיאום בוצע' });
            const result = await manager.updateStatus('l1', { notes: 'תיאום בוצע' });
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
//# sourceMappingURL=leads.manager.spec.js.map