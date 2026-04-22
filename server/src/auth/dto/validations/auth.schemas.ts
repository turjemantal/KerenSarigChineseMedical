import * as Joi from 'joi';
import {
  PHONE_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  OTP_CODE_LENGTH,
} from '../../../common/constants/validation.constants';

export const requestOtpSchema = Joi.object({
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי תקין (05X-XXXXXXX)',
    'any.required': 'טלפון הוא שדה חובה',
  }),
});

export const verifyOtpSchema = Joi.object({
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': 'מספר טלפון לא תקין',
    'any.required': 'טלפון הוא שדה חובה',
  }),
  code: Joi.string().length(OTP_CODE_LENGTH).pattern(/^\d+$/).required().messages({
    'string.length': `קוד האימות חייב להכיל ${OTP_CODE_LENGTH} ספרות`,
    'string.pattern.base': 'קוד האימות חייב להכיל ספרות בלבד',
    'any.required': 'קוד אימות הוא שדה חובה',
  }),
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).optional(),
});

export const adminLoginSchema = Joi.object({
  password: Joi.string().required().messages({
    'any.required': 'סיסמה היא שדה חובה',
    'string.empty': 'סיסמה היא שדה חובה',
  }),
});

export const updateNameSchema = Joi.object({
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).required().messages({
    'string.min': `שם חייב להכיל לפחות ${NAME_MIN_LENGTH} תווים`,
    'string.empty': 'שם הוא שדה חובה',
    'any.required': 'שם הוא שדה חובה',
  }),
});
