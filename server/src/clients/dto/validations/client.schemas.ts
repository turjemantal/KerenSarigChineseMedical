import * as Joi from 'joi';
import {
  PHONE_REGEX,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from '../../../common/constants/validation.constants';
import { ERRORS } from '../../../common/constants/errors.constants';

export const createClientSchema = Joi.object({
  phone: Joi.string().pattern(PHONE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_PHONE,
    'any.required': ERRORS.REQUIRED_PHONE,
  }),
  name: Joi.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).required().messages({
    'string.min': ERRORS.nameMinLength(NAME_MIN_LENGTH),
    'string.max': ERRORS.nameMaxLength(NAME_MAX_LENGTH),
    'string.empty': ERRORS.REQUIRED_NAME,
    'any.required': ERRORS.REQUIRED_NAME,
  }),
});
