import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappMessagingProvider } from '../src/integrations/whatsapp/whatsapp-messaging.provider';
import { WhatsappService } from '../src/integrations/whatsapp/whatsapp.service';
import { CLINIC_ADDRESS } from '../src/common/constants/defaults.constants';

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

  // Mirrors the booking_rejected contract: with no dedicated template approved there is
  // no sensible fallback, so the send is skipped rather than fired at the API.
  describe('sendBookingCancelled', () => {
    it('resolves false without calling the API when no template is configured', async () => {
      const sent = await provider.sendBookingCancelled('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(sent).toBe(false);
      expect(mockWhatsapp.sendTemplate).not.toHaveBeenCalled();
    });

    it('sends the configured template with first name, Hebrew date, and time', async () => {
      process.env.WHATSAPP_TEMPLATE_BOOKING_CANCELLED = 'booking_cancelled';
      await provider.sendBookingCancelled('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'booking_cancelled',
        ['Alice', '1 במאי 2026', '09:00'],
      );
      delete process.env.WHATSAPP_TEMPLATE_BOOKING_CANCELLED;
    });
  });

  describe('sendCancellationAlert', () => {
    it('resolves false without calling the API when no template is configured', async () => {
      const sent = await provider.sendCancellationAlert('0509999999', 'Alice Smith', '2026-05-01', '09:00');
      expect(sent).toBe(false);
      expect(mockWhatsapp.sendTemplate).not.toHaveBeenCalled();
    });

    it('sends the configured template when one is set', async () => {
      process.env.WHATSAPP_TEMPLATE_CANCELLATION_ALERT = 'cancellation_alert';
      await provider.sendCancellationAlert('0509999999', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0509999999',
        'cancellation_alert',
        ['Alice', '1 במאי 2026', '09:00'],
      );
      delete process.env.WHATSAPP_TEMPLATE_CANCELLATION_ALERT;
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

  describe('sendBookingRejected', () => {
    it('sends the booking_rejected template when configured', async () => {
      process.env.WHATSAPP_TEMPLATE_BOOKING_REJECTED = 'booking_rejected';
      await provider.sendBookingRejected('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'booking_rejected',
        ['Alice', '1 במאי 2026', '09:00'],
      );
      delete process.env.WHATSAPP_TEMPLATE_BOOKING_REJECTED;
    });

    it('skips the send (returns false, no API call) when the template is not configured', async () => {
      delete process.env.WHATSAPP_TEMPLATE_BOOKING_REJECTED;
      const ok = await provider.sendBookingRejected('0501234567', 'Alice Smith', '2026-05-01', '09:00');
      expect(ok).toBe(false);
      expect(mockWhatsapp.sendTemplate).not.toHaveBeenCalled();
    });
  });

  describe('sendAppointmentReminder', () => {
    it('sends the time and the clinic address as template parameters', async () => {
      await provider.sendAppointmentReminder('0501234567', '14:30');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0501234567',
        'appointment_reminder',
        ['14:30', CLINIC_ADDRESS],
      );
    });
  });

  describe('sendNewLeadAlert', () => {
    it('sends the lead name, phone, and concern as template parameters', async () => {
      process.env.WHATSAPP_TEMPLATE_LEAD_ALERT = 'lead_alert';
      await provider.sendNewLeadAlert('0509999999', 'Alice Smith', '0501234567', 'כאב גב');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0509999999',
        'lead_alert',
        ['Alice Smith', '0501234567', 'כאב גב'],
      );
      delete process.env.WHATSAPP_TEMPLATE_LEAD_ALERT;
    });

    it('falls back to booking_confirmation when lead_alert is not configured', async () => {
      delete process.env.WHATSAPP_TEMPLATE_LEAD_ALERT;
      await provider.sendNewLeadAlert('0509999999', 'Alice Smith', '0501234567', 'כאב גב');
      expect(mockWhatsapp.sendTemplate).toHaveBeenCalledWith(
        '0509999999',
        'booking_confirmation',
        ['Alice Smith', '0501234567', 'כאב גב'],
      );
    });
  });
});
