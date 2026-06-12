import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, HttpException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { Otp } from '../src/auth/otp.schema';
import { ClientsService } from '../src/clients/clients.service';
import { MESSAGING_PROVIDER } from '../src/integrations/messaging/messaging.token';
import { RequestOtpDto } from '../src/auth/dto/request-otp.dto';
import { VerifyOtpDto } from '../src/auth/dto/verify-otp.dto';
import { AdminLoginDto } from '../src/auth/dto/admin-login.dto';
import { UpdateNameDto } from '../src/auth/dto/update-name.dto';

const validPhone = '0501234567';
const mockOtp = { phone: validPhone, code: '123456', createdAt: new Date(Date.now() - 60_000), expiresAt: new Date(Date.now() + 60_000) };
const mockClient = { _id: 'c1', phone: validPhone, name: 'Test User', email: null };

// helper: make otpModel.find(...).sort(...).exec() resolve to the given send history
const mockSendHistory = (docs: { createdAt: Date }[]) =>
  mockOtpModel.find.mockReturnValueOnce({ sort: () => ({ exec: jest.fn().mockResolvedValue(docs) }) });

const mockOtpModel = {
  find: jest.fn(),
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

const mockMessagingService = {
  sendOtp: jest.fn().mockResolvedValue(undefined),
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
        { provide: MESSAGING_PROVIDER, useValue: mockMessagingService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('creates a new OTP for a valid phone with no recent sends', async () => {
      mockSendHistory([]);
      mockOtpModel.create.mockResolvedValueOnce(mockOtp);
      const result = await service.requestOtp({ phone: validPhone });
      expect(mockOtpModel.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'OTP sent' });
    });

    it('sends the OTP code via messaging service', async () => {
      mockSendHistory([]);
      mockOtpModel.create.mockResolvedValueOnce(mockOtp);
      await service.requestOtp({ phone: validPhone });
      expect(mockMessagingService.sendOtp).toHaveBeenCalledWith(
        validPhone,
        expect.stringMatching(/^\d+$/),
      );
    });

    it('blocks a resend during the cooldown (too soon after the last code)', async () => {
      mockSendHistory([{ createdAt: new Date(Date.now() - 5_000) }]); // 5s ago
      await expect(service.requestOtp({ phone: validPhone })).rejects.toThrow(HttpException);
      expect(mockOtpModel.create).not.toHaveBeenCalled();
      expect(mockMessagingService.sendOtp).not.toHaveBeenCalled();
    });

    it('allows a resend once the cooldown has passed', async () => {
      mockSendHistory([{ createdAt: new Date(Date.now() - 2 * 60_000) }]); // 2 min ago
      mockOtpModel.create.mockResolvedValueOnce(mockOtp);
      await expect(service.requestOtp({ phone: validPhone })).resolves.toEqual({ message: 'OTP sent' });
    });

    it('blocks sending once the per-phone daily cap is reached', async () => {
      const old = { createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }; // 3h ago — past cooldown
      mockSendHistory([old, old, old, old, old]); // 5 sends == cap
      await expect(service.requestOtp({ phone: validPhone })).rejects.toThrow(HttpException);
      expect(mockMessagingService.sendOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('returns token and client when OTP is valid and not expired', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockOtp) });
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockClientsService.findOrCreate.mockResolvedValueOnce(mockClient);
      mockJwtService.sign.mockReturnValueOnce('mock.jwt.token');

      const dto: VerifyOtpDto = { phone: validPhone, code: '123456' };
      const result = await service.verifyOtp(dto);
      expect(result.token).toBe('mock.jwt.token');
      expect(result.client).toMatchObject({ phone: validPhone });
    });

    it('deletes OTP after successful verification', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockOtp) });
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockClientsService.findOrCreate.mockResolvedValueOnce(mockClient);
      mockJwtService.sign.mockReturnValueOnce('tok');
      await service.verifyOtp({ phone: validPhone, code: '123456' });
      expect(mockOtpModel.deleteMany).toHaveBeenCalledWith({ phone: validPhone });
    });

    it('throws BadRequestException when OTP code is wrong', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.verifyOtp({ phone: validPhone, code: 'wrong' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when OTP is expired', async () => {
      const expired = { ...mockOtp, expiresAt: new Date(Date.now() - 1000) };
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(expired) });
      await expect(service.verifyOtp({ phone: validPhone, code: '123456' })).rejects.toThrow(BadRequestException);
    });

    it('passes optional name to findOrCreate', async () => {
      mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockOtp) });
      mockOtpModel.deleteMany.mockResolvedValueOnce({});
      mockClientsService.findOrCreate.mockResolvedValueOnce(mockClient);
      mockJwtService.sign.mockReturnValueOnce('tok');
      await service.verifyOtp({ phone: validPhone, code: '123456', name: 'New Name' });
      expect(mockClientsService.findOrCreate).toHaveBeenCalledWith(validPhone, 'New Name');
    });
  });

  describe('adminLogin', () => {
    const originalEnv = process.env;
    beforeEach(() => { process.env = { ...originalEnv, ADMIN_PASSWORD: 'secret123' }; });
    afterEach(() => { process.env = originalEnv; });

    it('returns a token for the correct admin password', async () => {
      mockJwtService.sign.mockReturnValueOnce('admin.token');
      const dto: AdminLoginDto = { password: 'secret123' };
      const result = await service.adminLogin(dto);
      expect(result.token).toBe('admin.token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { sub: 'admin', role: 'admin' },
        { expiresIn: '12h' },
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      await expect(service.adminLogin({ password: 'wrongpass' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when ADMIN_PASSWORD env is unset', async () => {
      delete process.env.ADMIN_PASSWORD;
      await expect(service.adminLogin({ password: 'anything' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateName', () => {
    it('updates name and issues a fresh token', async () => {
      const updated = { ...mockClient, name: 'New Name' };
      mockClientsService.updateName.mockResolvedValueOnce(updated);
      mockJwtService.sign.mockReturnValueOnce('new.jwt.token');
      const dto: UpdateNameDto = { name: 'New Name' };
      const result = await service.updateName(validPhone, dto);
      expect(result.token).toBe('new.jwt.token');
      expect((result.client as { name: string }).name).toBe('New Name');
    });

    it('throws BadRequestException when client is not found', async () => {
      mockClientsService.updateName.mockResolvedValueOnce(null);
      await expect(service.updateName('0509999999', { name: 'X' })).rejects.toThrow(BadRequestException);
    });
  });
});
