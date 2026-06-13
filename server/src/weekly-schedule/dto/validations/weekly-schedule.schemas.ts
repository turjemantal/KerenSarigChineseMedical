import * as Joi from 'joi';
import { TIME_REGEX } from '../../../common/constants/validation.constants';
import { ERRORS } from '../../../common/constants/errors.constants';

export const updateWeekdaySchema = Joi.object({
  times: Joi.array()
    .items(Joi.string().pattern(TIME_REGEX).messages({ 'string.pattern.base': ERRORS.INVALID_TIME_FORMAT }))
    .required(),
});
