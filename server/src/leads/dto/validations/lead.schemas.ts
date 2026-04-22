import * as Joi from 'joi';
import { LeadStatus } from '../../../common/enums/lead-status.enum';
import {
  PHONE_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  CONCERN_MIN_LENGTH,
  CONCERN_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  SOURCE_MAX_LENGTH,
  TREATMENT_MAX_LENGTH,
} from '../../../common/constants/validation.constants';

export const createLeadSchema = Joi.object({
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).required().messages({
    'string.min': 'שם חייב להכיל לפחות 2 תווים',
    'string.max': 'שם לא יכול לעלות על 100 תווים',
    'any.required': 'שם הוא שדה חובה',
  }),
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי תקין (05X-XXXXXXX)',
    'any.required': 'טלפון הוא שדה חובה',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
    'string.email': 'כתובת אימייל לא תקינה',
  }),
  concern: Joi.string().trim().min(CONCERN_MIN_LENGTH).max(CONCERN_MAX_LENGTH).required().messages({
    'string.min': 'אנא תארו את הבעיה ב-4 תווים לפחות',
    'string.max': 'תיאור הבעיה לא יכול לעלות על 500 תווים',
    'any.required': 'תיאור הבעיה הוא שדה חובה',
  }),
  treatment: Joi.string().max(TREATMENT_MAX_LENGTH).optional().allow(''),
  preferredDate: Joi.string().optional().allow(''),
  preferredTime: Joi.string().optional().allow(''),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
  source: Joi.string().max(SOURCE_MAX_LENGTH).optional().allow(''),
});

export const updateLeadSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(LeadStatus))
    .optional()
    .messages({ 'any.only': 'סטטוס לא תקין' }),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
});
