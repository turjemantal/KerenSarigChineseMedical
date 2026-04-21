import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from '../src/clients/clients.service';
import { ClientsDao } from '../src/clients/clients.dao';

const existingClient = { _id: 'c1', phone: '0501234567', name: 'Alice', email: null };
const newClient     = { _id: 'c2', phone: '0509876543', name: undefined, email: null };

const mockDao = {
  findByPhone: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

describe('ClientsService', () => {
  let service: ClientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsDao, useValue: mockDao },
      ],
    }).compile();
    service = module.get<ClientsService>(ClientsService);
    jest.clearAllMocks();
  });

  describe('findOrCreate', () => {
    it('returns existing client without modifying when they already have a name', async () => {
      mockDao.findByPhone.mockResolvedValueOnce(existingClient);
      const result = await service.findOrCreate('0501234567', 'Other Name');
      expect(mockDao.update).not.toHaveBeenCalled();
      expect(result).toBe(existingClient);
    });

    it('calls dao.update when existing client has no name', async () => {
      const noName = { ...existingClient, name: undefined };
      mockDao.findByPhone.mockResolvedValueOnce(noName);
      mockDao.update.mockResolvedValueOnce({ ...noName, name: 'Bob' });
      await service.findOrCreate('0501234567', 'Bob');
      expect(mockDao.update).toHaveBeenCalledWith('0501234567', 'Bob');
    });

    it('creates a new client when none exists', async () => {
      mockDao.findByPhone.mockResolvedValueOnce(null);
      mockDao.create.mockResolvedValueOnce(newClient);
      const result = await service.findOrCreate('0509876543');
      expect(mockDao.create).toHaveBeenCalledWith('0509876543', undefined);
      expect(result).toBe(newClient);
    });

    it('creates a new client with name when provided', async () => {
      mockDao.findByPhone.mockResolvedValueOnce(null);
      mockDao.create.mockResolvedValueOnce({ ...newClient, name: 'Charlie' });
      await service.findOrCreate('0509876543', 'Charlie');
      expect(mockDao.create).toHaveBeenCalledWith('0509876543', 'Charlie');
    });

    it('does not overwrite existing name with empty string', async () => {
      mockDao.findByPhone.mockResolvedValueOnce(existingClient);
      await service.findOrCreate('0501234567', '');
      expect(mockDao.update).not.toHaveBeenCalled();
    });
  });

  describe('updateName', () => {
    it('delegates to dao.update and returns updated client', async () => {
      const updated = { ...existingClient, name: 'New Name' };
      mockDao.update.mockResolvedValueOnce(updated);
      const result = await service.updateName('0501234567', 'New Name');
      expect(mockDao.update).toHaveBeenCalledWith('0501234567', 'New Name');
      expect(result).toBe(updated);
    });

    it('returns null when client is not found', async () => {
      mockDao.update.mockResolvedValueOnce(null);
      const result = await service.updateName('0500000000', 'X');
      expect(result).toBeNull();
    });
  });
});
