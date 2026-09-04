import { envSchema } from '../src/config/env.validation';
import { AppEnv } from '../src/common/enums/app-env.enum';
import { MessagingProvider } from '../src/common/enums/messaging-provider.enum';

const baseProdSmsEnv = {
  APP_ENV: AppEnv.Prod,
  CLIENT_URL: 'https://example.com',
  JWT_SECRET: 'secret',
  ADMIN_PASSWORD: 'password',
  MESSAGING_PROVIDER: MessagingProvider.Sms,
  SMS_019_USERNAME: 'keren',
  SMS_019_TOKEN: 'topsecret',
};

describe('envSchema — 019sms credentials', () => {
  it('accepts a complete 019sms configuration', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      SMS_019_SENDER: 'KerenSarig',
    });
    expect(error).toBeUndefined();
  });

  it('rejects SMS in prod without a username', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      SMS_019_SENDER: 'KerenSarig',
      SMS_019_USERNAME: undefined, // Joi treats undefined as absent
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('SMS_019_USERNAME');
  });

  it('rejects SMS in prod without a token', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      SMS_019_SENDER: 'KerenSarig',
      SMS_019_TOKEN: undefined, // Joi treats undefined as absent
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('SMS_019_TOKEN');
  });

  it('rejects SMS in prod without a sender', () => {
    const { error } = envSchema.validate(baseProdSmsEnv);
    expect(error).toBeDefined();
    expect(error!.message).toContain('SMS_019_SENDER');
  });

  it('rejects a sender longer than 11 characters', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      SMS_019_SENDER: 'KerenSarigTA', // 12 chars
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('SMS_019_SENDER');
  });

  it('rejects a sender with characters outside English letters/digits', () => {
    const { error } = envSchema.validate({
      ...baseProdSmsEnv,
      SMS_019_SENDER: '+9721234567',
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('SMS_019_SENDER');
  });

  it('does not require 019sms credentials in TEST env', () => {
    const { error } = envSchema.validate({
      APP_ENV: AppEnv.Test,
      JWT_SECRET: 'secret',
      ADMIN_PASSWORD: 'password',
    });
    expect(error).toBeUndefined();
  });

  it('does not require 019sms credentials when the provider is WhatsApp', () => {
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

  // The cancellation templates are optional — a prod deploy must not fail just because
  // no dedicated WhatsApp template has been approved yet (the SMS path needs none).
  it('does not require the cancellation templates', () => {
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

  it('accepts the cancellation templates when they are configured', () => {
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
      WHATSAPP_TEMPLATE_BOOKING_CANCELLED: 'booking_cancelled',
      WHATSAPP_TEMPLATE_CANCELLATION_ALERT: 'cancellation_alert',
    });
    expect(error).toBeUndefined();
  });
});
