import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from '../src/integrations/sms/sms.service';
import { AppEnv } from '../src/common/enums/app-env.enum';
import { SMS_019_API_URL } from '../src/common/constants/sms.constants';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SmsService', () => {
  let service: SmsService;
  const originalEnv = process.env;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService],
    }).compile();
    service = module.get<SmsService>(SmsService);
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      APP_ENV: AppEnv.Prod,
      SMS_019_USERNAME: 'keren',
      SMS_019_TOKEN: 'test-token',
      SMS_019_SENDER: 'KerenSarig',
    };
  });

  afterEach(() => { process.env = originalEnv; });

  describe('TEST mode', () => {
    it('skips sending and does not call fetch', async () => {
      process.env.APP_ENV = AppEnv.Test;
      const result = await service.sendSms('0501234567', 'שלום');
      expect(result).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('PROD mode', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ status: 0, message: 'SMS will be sent', shipment_id: '12345' }),
      });
    });

    it('calls the 019sms API with correct URL, auth header, and content type', async () => {
      await service.sendSms('0501234567', 'שלום');
      expect(mockFetch).toHaveBeenCalledWith(
        SMS_019_API_URL,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('sends the recipient in local format inside destinations.phone', async () => {
      await service.sendSms('0501234567', 'שלום');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.sms.destinations.phone).toEqual([{ _: '0501234567' }]);
    });

    it('carries the account username, sender, and message text', async () => {
      await service.sendSms('0501234567', 'הודעת בדיקה');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.sms.user).toEqual({ username: 'keren' });
      expect(body.sms.source).toBe('KerenSarig');
      expect(body.sms.message).toBe('הודעת בדיקה');
    });

    it('returns true when 019sms accepts the message (status 0)', async () => {
      await expect(service.sendSms('0501234567', 'שלום')).resolves.toBe(true);
    });

    it('returns false and logs on a non-zero 019sms status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ status: 4, message: 'Not enough credit' }),
      });
      const logSpy = jest.spyOn(service['logger'], 'error');
      await expect(service.sendSms('0501234567', 'שלום')).resolves.toBe(false);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to send'));
    });

    it('returns false and logs on a non-ok HTTP response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, text: async () => 'Unauthorized' });
      const logSpy = jest.spyOn(service['logger'], 'error');
      await expect(service.sendSms('0501234567', 'שלום')).resolves.toBe(false);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to send'));
    });

    it('returns false on a non-JSON response body', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '<html>error</html>' });
      await expect(service.sendSms('0501234567', 'שלום')).resolves.toBe(false);
    });

    it('returns false and logs on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network timeout'));
      const logSpy = jest.spyOn(service['logger'], 'error');
      await expect(service.sendSms('0501234567', 'שלום')).resolves.toBe(false);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Network error'));
    });

    it('masks the recipient and never logs the message text', async () => {
      mockFetch.mockRejectedValueOnce(new Error('boom'));
      const logSpy = jest.spyOn(service['logger'], 'error');
      await service.sendSms('0501234567', 'סוד רפואי');
      const logged = logSpy.mock.calls.map(args => String(args[0])).join('\n');
      expect(logged).toContain('050***4567');
      expect(logged).not.toContain('0501234567');
      expect(logged).not.toContain('סוד רפואי');
    });
  });
});
