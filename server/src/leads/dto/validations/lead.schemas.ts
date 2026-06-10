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
import { ERRORS } from '../../../common/constants/errors.constants';

export const createLeadSchema = Joi.object({
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).required().messages({
    'string.min': ERRORS.nameMinLength(NAME_MIN_LENGTH),
    'string.max': ERRORS.nameMaxLength(NAME_MAX_LENGTH),
    'any.required': ERRORS.REQUIRED_NAME,
  }),
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_PHONE,
    'any.required': ERRORS.REQUIRED_PHONE,
  }),
  email: Joi.string().email({ tlds: { allow: false } }).optional().allow('').messages({
    'string.email': ERRORS.INVALID_EMAIL,
  }),
  concern: Joi.string().trim().min(CONCERN_MIN_LENGTH).max(CONCERN_MAX_LENGTH).required().messages({
    'string.min': ERRORS.concernMinLength(CONCERN_MIN_LENGTH),
    'string.max': ERRORS.concernMaxLength(CONCERN_MAX_LENGTH),
    'any.required': ERRORS.REQUIRED_CONCERN,
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
    .messages({ 'any.only': ERRORS.INVALID_STATUS }),
  notes: Joi.string().max(NOTES_MAX_LENGTH).optional().allow(''),
});
