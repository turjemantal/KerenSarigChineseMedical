export const config = {
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
      return process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
    },
    clientExpiry: '30d',
    adminExpiry: '12h',
  },

  get adminPassword(): string | undefined {
    return process.env.ADMIN_PASSWORD;
  },

  whatsapp: {
    get accessToken(): string | undefined {
      return process.env.WHATSAPP_ACCESS_TOKEN;
    },
    get phoneNumberId(): string | undefined {
      return process.env.WHATSAPP_PHONE_NUMBER_ID;
    },
    apiBase: 'https://graph.facebook.com',
    apiVersion: 'v21.0',
    templateLanguage: 'he',
  },
};
