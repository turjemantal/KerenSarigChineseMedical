import * as Joi from 'joi';
import {
  PHONE_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  OTP_CODE_LENGTH,
} from '../../../common/constants/validation.constants';
import { ERRORS } from '../../../common/constants/errors.constants';

export const requestOtpSchema = Joi.object({
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_PHONE,
    'any.required': ERRORS.REQUIRED_PHONE,
  }),
});

export const verifyOtpSchema = Joi.object({
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_PHONE,
    'any.required': ERRORS.REQUIRED_PHONE,
  }),
  code: Joi.string().length(OTP_CODE_LENGTH).pattern(/^\d+$/).required().messages({
    'string.length': ERRORS.otpLength(OTP_CODE_LENGTH),
    'string.pattern.base': ERRORS.OTP_DIGITS_ONLY,
    'any.required': ERRORS.REQUIRED_OTP,
  }),
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).optional(),
});

export const adminLoginSchema = Joi.object({
  password: Joi.string().required().messages({
    'any.required': ERRORS.REQUIRED_PASSWORD,
    'string.empty': ERRORS.REQUIRED_PASSWORD,
  }),
});

export const updateNameSchema = Joi.object({
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).required().messages({
    'string.min': ERRORS.nameMinLength(NAME_MIN_LENGTH),
    'string.empty': ERRORS.REQUIRED_NAME,
    'any.required': ERRORS.REQUIRED_NAME,
  }),
});
