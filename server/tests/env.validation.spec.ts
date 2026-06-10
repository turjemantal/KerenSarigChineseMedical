import { envSchema } from '../src/config/env.validation';
import { AppEnv } from '../src/common/enums/app-env.enum';
import { MessagingProvider } from '../src/common/enums/messaging-provider.enum';

const VALID_ACCOUNT_SID = 'AC' + 'a'.repeat(32);
const VALID_API_KEY_SID = 'SK' + 'a'.repeat(32);

const baseProdSmsEnv = {
  APP_ENV: AppEnv.Prod,
  CLIENT_URL: 'https://example.com',
  JWT_SECRET: 'secret',
  ADMIN_PASSWORD: 'password',
  MESSAGING_PROVIDER: MessagingProvider.Sms,
  TWILIO_ACCOUNT_SID: VALID_ACCOUNT_SID,
  TWILIO_FROM_NUMBER: '+15555555555',
};

describe('envSchema — Twilio API key auth', () => {
  it('accepts a complete API key configuration', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      TWILIO_API_KEY_SID: VALID_API_KEY_SID,
      TWILIO_API_KEY_SECRET: 'topsecret',
    });
    expect(error).toBeUndefined();
  });

  it('rejects SMS in prod without an API key SID', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      TWILIO_API_KEY_SECRET: 'topsecret',
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('TWILIO_API_KEY_SID');
  });

  it('rejects an API key SID without its secret', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      TWILIO_API_KEY_SID: VALID_API_KEY_SID,
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('TWILIO_API_KEY_SECRET');
  });

  it('rejects a malformed API key SID (must start with SK)', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      TWILIO_API_KEY_SID: VALID_ACCOUNT_SID, // AC… is not an API key
      TWILIO_API_KEY_SECRET: 'topsecret',
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('TWILIO_API_KEY_SID');
  });

  it('rejects a malformed account SID (must start with AC)', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      TWILIO_ACCOUNT_SID: VALID_API_KEY_SID, // SK… is not an account SID
      TWILIO_API_KEY_SID: VALID_API_KEY_SID,
      TWILIO_API_KEY_SECRET: 'topsecret',
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('TWILIO_ACCOUNT_SID');
  });

  it('does not require Twilio credentials in TEST env', () => {
    const { error } = envSchema.validate({
      APP_ENV: AppEnv.Test,
      JWT_SECRET: 'secret',
      ADMIN_PASSWORD: 'password',
    });
    expect(error).toBeUndefined();
  });

  it('does not require Twilio credentials when the provider is WhatsApp', () => {
    const { error } = envSchema.validate({
      APP_ENV: AppEnv.Prod,
      CLIENT_URL: 'https://example.com',
      JWT_SECRET: 'secret',
      ADMIN_PASSWORD: 'password',
      MESSAGING_PROVIDER: MessagingProvider.Whatsapp,
      WHATSAPP_ACCESS_TOKEN: 'token',
      WHATSAPP_PHONE_NUMBER_ID: '123',
      WHATSAPP_TEMPLATE_LANGUAGE: 'he',
      WHATSAPP_TEMPLATE_OTP: 'otp_code',
      WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION: 'booking_confirmation',
      WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER: 'appointment_reminder',
    });
    expect(error).toBeUndefined();
  });
});
