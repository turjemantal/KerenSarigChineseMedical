import { Test, TestingModule } from '@nestjs/testing';
import { SmsMessagingProvider } from '../src/integrations/sms/sms-messaging.provider';
import { SmsService } from '../src/integrations/sms/sms.service';

const mockSms = { sendSms: jest.fn().mockResolvedValue(undefined) };

describe('SmsMessagingProvider', () => {
  let provider: SmsMessagingProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsMessagingProvider,
        { provide: SmsService, useValue: mockSms },
      ],
    }).compile();
    provider = module.get<SmsMessagingProvider>(SmsMessagingProvider);
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('sends a Hebrew SMS containing the OTP code', async () => {
      await provider.sendOtp('0501234567', '654321');
      expect(mockSms.sendSms).toHaveBeenCalledWith(
        '0501234567',
        expect.stringContaining('654321'),
      );
    });

    it('mentions the 10-minute expiry in the message', async () => {
      await provider.sendOtp('0501234567', '123456');
      expect(mockSms.sendSms).toHaveBeenCalledWith(
        '0501234567',
        expect.stringContaining('10'),
      );
    });
  });

  describe('sendBookingConfirmation', () => {
    it('sends a Hebrew SMS with first name, Hebrew date, and time', async () => {
      await provider.sendBookingConfirmation('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockSms.sendSms).toHaveBeenCalledWith(
        '0501234567',
        expect.stringContaining('Alice'),
      );
      expect(mockSms.sendSms).toHaveBeenCalledWith(
        '0501234567',
        expect.stringContaining('מאי'),
      );
      expect(mockSms.sendSms).toHaveBeenCalledWith(
        '0501234567',
        expect.stringContaining('09:00'),
      );
    });

    it('uses only the first name when full name is provided', async () => {
      await provider.sendBookingConfirmation('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      const text: string = mockSms.sendSms.mock.calls[0][1];
      expect(text).not.toContain('Smith');
    });
  });

  describe('sendBookingRequestReceived', () => {
    it('sends a pending-approval SMS with first name, Hebrew date, and time', async () => {
      await provider.sendBookingRequestReceived('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      const text: string = mockSms.sendSms.mock.calls[0][1];
      expect(text).toContain('Alice');
      expect(text).toContain('מאי');
      expect(text).toContain('09:00');
      expect(text).toContain('ממתינה לאישור');
    });

    it('does not claim the appointment is approved', async () => {
      await provider.sendBookingRequestReceived('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      const text: string = mockSms.sendSms.mock.calls[0][1];
      expect(text).not.toMatch(/(^|\s)אושר/);
    });
  });

  describe('sendNewBookingAlert', () => {
    it('sends an admin alert with name, Hebrew date, and time', async () => {
      await provider.sendNewBookingAlert('0509999999', 'Alice Smith', '2026-05-01', '09:00');
      const text: string = mockSms.sendSms.mock.calls[0][1];
      expect(text).toContain('תור חדש ממתין לאישור');
      expect(text).toContain('Alice');
      expect(text).toContain('מאי');
      expect(text).toContain('09:00');
    });
  });

  describe('sendAppointmentReminder', () => {
    it('sends a Hebrew reminder SMS containing the appointment time', async () => {
      await provider.sendAppointmentReminder('0501234567', '14:30');
      expect(mockSms.sendSms).toHaveBeenCalledWith(
        '0501234567',
        expect.stringContaining('14:30'),
      );
    });
  });
});
