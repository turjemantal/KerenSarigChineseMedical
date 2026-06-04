import * as Joi from 'joi';

export const envSchema = Joi.object({
  PORT: Joi.number().default(3001),
  CLIENT_URL: Joi.string().required(),
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/keren-clinic'),

  JWT_SECRET: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().required(),

  WHATSAPP_ACCESS_TOKEN: Joi.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: Joi.string().when('WHATSAPP_ACCESS_TOKEN', { is: Joi.exist(), then: Joi.required() }),
  WHATSAPP_TEMPLATE_LANGUAGE: Joi.string().when('WHATSAPP_ACCESS_TOKEN', { is: Joi.exist(), then: Joi.required() }),
  WHATSAPP_TEMPLATE_OTP: Joi.string().when('WHATSAPP_ACCESS_TOKEN', { is: Joi.exist(), then: Joi.required() }),
  WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION: Joi.string().when('WHATSAPP_ACCESS_TOKEN', { is: Joi.exist(), then: Joi.required() }),
  WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER: Joi.string().when('WHATSAPP_ACCESS_TOKEN', { is: Joi.exist(), then: Joi.required() }),
}).options({ allowUnknown: true });
