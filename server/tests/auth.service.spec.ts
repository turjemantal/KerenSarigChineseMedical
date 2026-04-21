import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { Otp } from '../src/auth/otp.schema';
import { ClientsService } from '../src/clients/clients.service';
import { WhatsappService } from '../src/integrations/whatsapp/whatsapp.service';

const validPhone = '0501234567';
const mockOtp = { phone: validPhone, code: '123456', expiresAt: new Date(Date.now() + 60_000) };
const mockClient = { _id: 'c1', phone: validPhone, name: 'Test User', email: null };

const mockOtpModel = {
  deleteMany: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
};

const mockClientsService = {
  findOrCreate: jest.fn(),
  updateName: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockWhatsappService = {
  sendTemplate: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(Otp.name), useValue: mockOtpModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ClientsService, useValue: mockClientsService },
        { provide: WhatsappService, useValue: mockWhatsappService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('deletes existing OTPs and creates a new one for a valid phone', async () => {
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockOtpModel.create.mockResolvedValueOnce(mockOtp);
      const result = await service.requestOtp(validPhone);
      expect(mockOtpModel.deleteMany).toHaveBeenCalledWith({ phone: validPhone });
      expect(mockOtpModel.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'OTP sent' });
    });

    it('replaces any prior OTP with a fresh one on repeat requests', async () => {
      mockOtpModel.deleteMany.mockResolvedValue({});
      mockOtpModel.create.mockResolvedValue(mockOtp);
      await service.requestOtp(validPhone);
      await service.requestOtp(validPhone);
      expect(mockOtpModel.deleteMany).toHaveBeenCalledTimes(2);
      expect(mockOtpModel.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyOtp', () => {
    it('returns token and client when OTP is valid and not expired', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockOtp) });
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockClientsService.findOrCreate.mockResolvedValueOnce(mockClient);
      mockJwtService.sign.mockReturnValueOnce('mock.jwt.token');

      const result = await service.verifyOtp(validPhone, '123456');
      expect(result.token).toBe('mock.jwt.token');
      expect(result.client).toMatchObject({ phone: validPhone });
    });

    it('deletes OTP after successful verification', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockOtp) });
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockClientsService.findOrCreate.mockResolvedValueOnce(mockClient);
      mockJwtService.sign.mockReturnValueOnce('tok');
      await service.verifyOtp(validPhone, '123456');
      expect(mockOtpModel.deleteMany).toHaveBeenCalledWith({ phone: validPhone });
    });

    it('throws BadRequestException when OTP code is wrong', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.verifyOtp(validPhone, 'wrong')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when OTP is expired', async () => {
      const expired = { ...mockOtp, expiresAt: new Date(Date.now() - 1000) };
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(expired) });
      await expect(service.verifyOtp(validPhone, '123456')).rejects.toThrow(BadRequestException);
    });

    it('passes optional name to findOrCreate', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockOtp) });
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockClientsService.findOrCreate.mockResolvedValueOnce(mockClient);
      mockJwtService.sign.mockReturnValueOnce('tok');
      await service.verifyOtp(validPhone, '123456', 'New Name');
      expect(mockClientsService.findOrCreate).toHaveBeenCalledWith(validPhone, 'New Name');
    });
  });

  describe('adminLogin', () => {
    const originalEnv = process.env;
    beforeEach(() => { process.env = { ...originalEnv, ADMIN_PASSWORD: 'secret123' }; });
    afterEach(() => { process.env = originalEnv; });

    it('returns a token for the correct admin password', async () => {
      mockJwtService.sign.mockReturnValueOnce('admin.token');
      const result = await service.adminLogin('secret123');
      expect(result.token).toBe('admin.token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: 'admin', role: 'admin' },
        { expiresIn: '12h' },
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      await expect(service.adminLogin('wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when ADMIN_PASSWORD env is unset', async () => {
      delete process.env.ADMIN_PASSWORD;
      await expect(service.adminLogin('anything')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateName', () => {
    it('updates name and issues a fresh token', async () => {
      const updated = { ...mockClient, name: 'New Name' };
      mockClientsService.updateName.mockResolvedValueOnce(updated);
      mockJwtService.sign.mockReturnValueOnce('new.jwt.token');
      const result = await service.updateName(validPhone, 'New Name');
      expect(result.token).toBe('new.jwt.token');
      expect((result.client as any).name).toBe('New Name');
    });

    it('throws BadRequestException when client is not found', async () => {
      mockClientsService.updateName.mockResolvedValueOnce(null);
      await expect(service.updateName('0509999999', 'X')).rejects.toThrow(BadRequestException);
    });
  });
});
