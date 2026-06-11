import * as Joi from 'joi';
import { AppEnv } from '../common/enums/app-env.enum';
import { MessagingProvider } from '../common/enums/messaging-provider.enum';
import { TWILIO_ACCOUNT_SID_REGEX, TWILIO_API_KEY_SID_REGEX, PHONE_REGEX } from '../common/constants/validation.constants';

const realEnvs = [AppEnv.Dev, AppEnv.Prod];

// Optional: accepts absent or empty string (docker-compose passes empty strings for unset vars)
const optionalStr = Joi.string().allow('').optional();

// Required only in DEV/PROD — chained when() is more reliable than object reference
const requiredInRealEnv = Joi.when('APP_ENV', {
  is: Joi.valid(...realEnvs),
  then: Joi.string().required(),
  otherwise: optionalStr,
});

// Required (with optional format check) only in DEV/PROD when MESSAGING_PROVIDER=sms
const requiredForSmsMatching = (pattern?: RegExp) =>
  Joi.when('APP_ENV', {
    is: Joi.valid(...realEnvs),
    then: Joi.when('MESSAGING_PROVIDER', {
      is: MessagingProvider.Sms,
      then: (pattern ? Joi.string().pattern(pattern) : Joi.string()).required(),
      otherwise: optionalStr,
    }),
    otherwise: optionalStr,
  });

const requiredForSms = requiredForSmsMatching();

const requiredForWhatsapp = Joi.when('APP_ENV', {
  is: Joi.valid(...realEnvs),
  then: Joi.when('MESSAGING_PROVIDER', {
    is: MessagingProvider.Whatsapp,
    then: Joi.string().required(),
    otherwise: optionalStr,
  }),
  otherwise: optionalStr,
});

export const envSchema = Joi.object({
  APP_ENV: Joi.string().valid(...Object.values(AppEnv)).required(),

  PORT: Joi.number().default(3001),
  CLIENT_URL: requiredInRealEnv,
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/keren-clinic'),

  JWT_SECRET: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().required(),
  ADMIN_PHONE: Joi.string().pattern(PHONE_REGEX).allow('').optional(),

  MESSAGING_PROVIDER: Joi.string().valid(...Object.values(MessagingProvider)).default(MessagingProvider.Whatsapp),

  TWILIO_ACCOUNT_SID:    requiredForSmsMatching(TWILIO_ACCOUNT_SID_REGEX),
  TWILIO_API_KEY_SID:    requiredForSmsMatching(TWILIO_API_KEY_SID_REGEX),
  TWILIO_API_KEY_SECRET: requiredForSms,
  TWILIO_FROM_NUMBER:    requiredForSms,

  WHATSAPP_API_VERSION:                    optionalStr,
  WHATSAPP_ACCESS_TOKEN:                   requiredForWhatsapp,
  WHATSAPP_PHONE_NUMBER_ID:                requiredForWhatsapp,
  WHATSAPP_TEMPLATE_LANGUAGE:              requiredForWhatsapp,
  WHATSAPP_TEMPLATE_OTP:                   requiredForWhatsapp,
  WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION:  requiredForWhatsapp,
  WHATSAPP_TEMPLATE_BOOKING_REQUEST:       optionalStr,
  WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER:  requiredForWhatsapp,
}).options({ allowUnknown: true });
