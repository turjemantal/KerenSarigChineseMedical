import * as Joi from 'joi';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
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
} from '../../common/constants/validation.constants';

export const createAppointmentSchema = Joi.object({
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).optional(),
  phone: Joi.string().pattern(PHONE_REGEX).optional().messages({
    'string.pattern.base': 'מספר טלפון לא תקין (05X-XXXXXXX)',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
    'string.email': 'כתובת אימייל לא תקינה',
  }),
  treatment: Joi.string().max(TREATMENT_MAX_LENGTH).optional().allow(''),
  concern: Joi.string().trim().max(CONCERN_MAX_LENGTH).optional().allow(''),
  date: Joi.string().pattern(DATE_REGEX).required().messages({
    'string.pattern.base': 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD',
    'any.required': 'תאריך הוא שדה חובה',
  }),
  time: Joi.string().pattern(TIME_REGEX).required().messages({
    'string.pattern.base': 'שעה לא תקינה — נדרש פורמט HH:MM',
    'any.required': 'שעה היא שדה חובה',
  }),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
  source: Joi.string().max(SOURCE_MAX_LENGTH).optional().allow(''),
});

export const updateAppointmentSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(AppointmentStatus))
    .optional()
    .messages({ 'any.only': 'סטטוס לא תקין' }),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
});
