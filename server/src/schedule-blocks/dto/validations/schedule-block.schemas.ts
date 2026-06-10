import * as Joi from 'joi';
import { DATE_REGEX, TIME_REGEX, REASON_MAX_LENGTH } from '../../../common/constants/validation.constants';
import { ERRORS } from '../../../common/constants/errors.constants';

export const createScheduleBlockSchema = Joi.object({
  startDate: Joi.string().pattern(DATE_REGEX).required().messages({
    'string.pattern.base': ERRORS.INVALID_DATE_FORMAT,
    'any.required': ERRORS.REQUIRED_START_DATE,
  }),
  endDate: Joi.string().pattern(DATE_REGEX).optional().messages({
    'string.pattern.base': ERRORS.INVALID_DATE_FORMAT,
  }),
  startTime: Joi.string().pattern(TIME_REGEX).optional().messages({
    'string.pattern.base': ERRORS.INVALID_TIME_FORMAT,
  }),
  endTime: Joi.string().pattern(TIME_REGEX).optional().messages({
    'string.pattern.base': ERRORS.INVALID_TIME_FORMAT,
  }),
  reason: Joi.string().trim().max(REASON_MAX_LENGTH).optional().allow(''),
})
  .and('startTime', 'endTime')
  .messages({ 'object.and': ERRORS.TIMES_REQUIRE_BOTH });
