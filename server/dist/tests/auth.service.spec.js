"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../src/auth/auth.service");
const otp_schema_1 = require("../src/auth/otp.schema");
const clients_service_1 = require("../src/clients/clients.service");
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
describe('AuthService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: (0, mongoose_1.getModelToken)(otp_schema_1.Otp.name), useValue: mockOtpModel },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: clients_service_1.ClientsService, useValue: mockClientsService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
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
            await expect(service.verifyOtp(validPhone, 'wrong')).rejects.toThrow(common_1.BadRequestException);
        });
        it('throws BadRequestException when OTP is expired', async () => {
            const expired = { ...mockOtp, expiresAt: new Date(Date.now() - 1000) };
            mockOtpModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(expired) });
            await expect(service.verifyOtp(validPhone, '123456')).rejects.toThrow(common_1.BadRequestException);
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
            expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'admin', role: 'admin' }, { expiresIn: '12h' });
        });
        it('throws UnauthorizedException for wrong password', async () => {
            await expect(service.adminLogin('wrongpass')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when ADMIN_PASSWORD env is unset', async () => {
            delete process.env.ADMIN_PASSWORD;
            await expect(service.adminLogin('anything')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('updateName', () => {
        it('updates name and issues a fresh token', async () => {
            const updated = { ...mockClient, name: 'New Name' };
            mockClientsService.updateName.mockResolvedValueOnce(updated);
            mockJwtService.sign.mockReturnValueOnce('new.jwt.token');
            const result = await service.updateName(validPhone, 'New Name');
            expect(result.token).toBe('new.jwt.token');
            expect(result.client.name).toBe('New Name');
        });
        it('throws BadRequestException when client is not found', async () => {
            mockClientsService.updateName.mockResolvedValueOnce(null);
            await expect(service.updateName('0509999999', 'X')).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map