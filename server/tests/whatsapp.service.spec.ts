import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from '../src/integrations/whatsapp/whatsapp.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WhatsappService', () => {
  let service: WhatsappService;
  const originalEnv = process.env;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappService],
    }).compile();
    service = module.get<WhatsappService>(WhatsappService);
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      APP_ENV: 'PROD',
      WHATSAPP_ACCESS_TOKEN: 'test-token',
      WHATSAPP_PHONE_NUMBER_ID: '1234567890',
      WHATSAPP_TEMPLATE_LANGUAGE: 'he',
      WHATSAPP_TEMPLATE_OTP: 'otp_code',
      WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION: 'booking_confirmation',
      WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER: 'appointment_reminder',
    };
  });

  afterEach(() => { process.env = originalEnv; });

  describe('TEST mode', () => {
    it('skips sending and does not call fetch', async () => {
      process.env.APP_ENV = 'TEST';
      await service.sendTemplate('0501234567', 'otp_code', ['123456']);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('PROD mode', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ messages: [{ id: 'wamid.123' }] }),
      });
    });

    it('calls the WhatsApp API with correct URL and auth header', async () => {
      await service.sendTemplate('0501234567', 'otp_code', ['123456']);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v21.0/1234567890/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      );
    });

    it('converts israeli 05X number to international format', async () => {
      await service.sendTemplate('0501234567', 'otp_code', ['123456']);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.to).toBe('972501234567');
    });

    it('includes body component when params are provided', async () => {
      await service.sendTemplate('0501234567', 'otp_code', ['123456']);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.template.components).toEqual([{
        type: 'body',
        parameters: [{ type: 'text', text: '123456' }],
      }]);
    });

    it('omits components when no params are provided', async () => {
      await service.sendTemplate('0501234567', 'jaspers_plain', []);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.template.components).toBeUndefined();
    });

    it('logs error on non-ok API response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: async () => '{"error":"bad token"}' });
      const logSpy = jest.spyOn(service['logger'], 'error');
      await service.sendTemplate('0501234567', 'otp_code', ['123456']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to send'));
    });

    it('logs error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network timeout'));
      const logSpy = jest.spyOn(service['logger'], 'error');
      await service.sendTemplate('0501234567', 'otp_code', ['123456']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Network error'));
    });
  });
});
