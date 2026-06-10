import { AppEnv } from '../common/enums/app-env.enum';
import { MessagingProvider } from '../common/enums/messaging-provider.enum';

export const config = {
  get isTest(): boolean {
    return process.env.APP_ENV === AppEnv.Test;
  },

  get port(): number {
    return Number(process.env.PORT ?? '3001');
  },
  get clientUrl(): string {
    return process.env.CLIENT_URL ?? 'http://localhost:5173';
  },
  get mongodbUri(): string {
    return process.env.MONGODB_URI ?? 'mongodb://localhost:27017/keren-clinic';
  },

  jwt: {
    get secret(): string {
      return process.env.JWT_SECRET!;
    },
    clientExpiry: '30d' as const,
    adminExpiry: '12h' as const,
  },

  get adminPassword(): string {
    return process.env.ADMIN_PASSWORD!;
  },

  messaging: {
    get provider(): MessagingProvider {
      return (process.env.MESSAGING_PROVIDER ?? MessagingProvider.Whatsapp) as MessagingProvider;
    },
  },

  twilio: {
    get accountSid(): string {
      return process.env.TWILIO_ACCOUNT_SID!;
    },
    // Scoped API key (SK…) + secret — revocable per-key without rotating the account token.
    get apiKeySid(): string {
      return process.env.TWILIO_API_KEY_SID!;
    },
    get apiKeySecret(): string {
      return process.env.TWILIO_API_KEY_SECRET!;
    },
    get fromNumber(): string {
      return process.env.TWILIO_FROM_NUMBER!;
    },
  },

  whatsapp: {
    get accessToken(): string {
      return process.env.WHATSAPP_ACCESS_TOKEN!;
    },
    get phoneNumberId(): string {
      return process.env.WHATSAPP_PHONE_NUMBER_ID!;
    },
    apiBase: 'https://graph.facebook.com',
    get apiVersion(): string {
      return process.env.WHATSAPP_API_VERSION ?? 'v21.0';
    },
    get templateLanguage(): string {
      return process.env.WHATSAPP_TEMPLATE_LANGUAGE!;
    },
    templates: {
      get otp(): string {
        return process.env.WHATSAPP_TEMPLATE_OTP!;
      },
      get bookingConfirmation(): string {
        return process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION!;
      },
      // falls back to the confirmation template until a dedicated "request received" template is approved
      get bookingRequest(): string {
        return process.env.WHATSAPP_TEMPLATE_BOOKING_REQUEST || process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION!;
      },
      get appointmentReminder(): string {
        return process.env.WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER!;
      },
    },
  },
};
