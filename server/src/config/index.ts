export const config = {
  get isTest(): boolean {
    return process.env.APP_ENV === 'TEST';
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

  whatsapp: {
    get accessToken(): string {
      return process.env.WHATSAPP_ACCESS_TOKEN!;
    },
    get phoneNumberId(): string {
      return process.env.WHATSAPP_PHONE_NUMBER_ID!;
    },
    apiBase: 'https://graph.facebook.com',
    apiVersion: 'v21.0',
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
      get appointmentReminder(): string {
        return process.env.WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER!;
      },
    },
  },
};
