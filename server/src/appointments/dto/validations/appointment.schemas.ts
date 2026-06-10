import * as Joi from 'joi';
import { AppointmentStatus } from '../../../common/enums/appointment-status.enum';
import {
  PHONE_REGEX,
  DATE_REGEX,
  TIME_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  CONCERN_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  SOURCE_MAX_LENGTH,
  TREATMENT_MAX_LENGTH,
} from '../../../common/constants/validation.constants';
import { ERRORS } from '../../../common/constants/errors.constants';

export const createAppointmentSchema = Joi.object({
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).optional(),
  phone: Joi.string().pattern(PHONE_REGEX).optional().messages({
    'string.pattern.base': ERRORS.INVALID_PHONE,
  }),
  email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
    'string.email': ERRORS.INVALID_EMAIL,
  }),
  treatment: Joi.string().max(TREATMENT_MAX_LENGTH).optional().allow(''),
  concern: Joi.string().trim().max(CONCERN_MAX_LENGTH).optional().allow(''),
  date: Joi.string().pattern(DATE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_DATE_FORMAT,
    'any.required': ERRORS.REQUIRED_DATE,
  }),
  time: Joi.string().pattern(TIME_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_TIME_FORMAT,
    'any.required': ERRORS.REQUIRED_TIME,
  }),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
  source: Joi.string().max(SOURCE_MAX_LENGTH).optional().allow(''),
});

export const updateAppointmentSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(AppointmentStatus))
    .optional()
    .messages({ 'any.only': ERRORS.INVALID_STATUS }),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
});
