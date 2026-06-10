import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappMessagingProvider } from '../src/integrations/whatsapp/whatsapp-messaging.provider';
import { WhatsappService } from '../src/integrations/whatsapp/whatsapp.service';

const mockWhatsapp = { sendTemplate: jest.fn().mockResolvedValue(undefined) };

beforeAll(() => {
  process.env.WHATSAPP_TEMPLATE_OTP = 'otp_code';
  process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION = 'booking_confirmation';
  process.env.WHATSAPP_TEMPLATE_BOOKING_REQUEST = 'booking_request';
  process.env.WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER = 'appointment_reminder';
});
afterAll(() => {
  delete process.env.WHATSAPP_TEMPLATE_OTP;
  delete process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION;
  delete process.env.WHATSAPP_TEMPLATE_BOOKING_REQUEST;
  delete process.env.WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER;
});

describe('WhatsappMessagingProvider', () => {
  let provider: WhatsappMessagingProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappMessagingProvider,
        { provide: WhatsappService, useValue: mockWhatsapp },
      ],
    }).compile();
    provider = module.get<WhatsappMessagingProvider>(WhatsappMessagingProvider);
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('sends the OTP code as a template parameter', async () => {
      await provider.sendOtp('0501234567', '123456');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'otp_code',
        ['123456'],
      );
    });
  });

  describe('sendBookingConfirmation', () => {
    it('sends first name, Hebrew date, and time as template parameters', async () => {
      await provider.sendBookingConfirmation('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'booking_confirmation',
        ['Alice', '1 במאי 2026', '09:00'],
      );
    });
  });

  describe('sendBookingRequestReceived', () => {
    it('sends the booking_request template with the same parameter shape', async () => {
      await provider.sendBookingRequestReceived('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'booking_request',
        ['Alice', '1 במאי 2026', '09:00'],
      );
    });

    it('falls back to booking_confirmation template when booking_request is not configured', async () => {
      delete process.env.WHATSAPP_TEMPLATE_BOOKING_REQUEST;
      await provider.sendBookingRequestReceived('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'booking_confirmation',
        ['Alice', '1 במאי 2026', '09:00'],
      );
      process.env.WHATSAPP_TEMPLATE_BOOKING_REQUEST = 'booking_request';
    });
  });

  describe('sendAppointmentReminder', () => {
    it('sends the time as a template parameter', async () => {
      await provider.sendAppointmentReminder('0501234567', '14:30');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'appointment_reminder',
        ['14:30'],
      );
    });
  });
});
