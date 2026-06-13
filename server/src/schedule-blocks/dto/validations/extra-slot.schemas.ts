import * as Joi from 'joi';
import { DATE_REGEX, TIME_REGEX } from '../../../common/constants/validation.constants';
import { ERRORS } from '../../../common/constants/errors.constants';

export const createExtraSlotSchema = Joi.object({
  date: Joi.string().pattern(DATE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_DATE_FORMAT,
    'any.required': ERRORS.REQUIRED_DATE,
  }),
  time: Joi.string().pattern(TIME_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_TIME_FORMAT,
    'any.required': ERRORS.REQUIRED_TIME,
  }),
});
