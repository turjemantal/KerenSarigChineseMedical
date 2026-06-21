import * as Joi from 'joi';
import { ERRORS } from '../../../common/constants/errors.constants';
import { MAX_PUBLIC_RANGE_DAYS } from '../../../common/constants/validation.constants';
import { MIN_BOOKING_AHEAD_DAYS, MIN_HOUR, MAX_HOUR } from '../../../common/constants/clinic-settings.constants';

// A partial patch — at least one field, each within its bounds. The booking horizon
// can never exceed the public availability-range cap, so a range query can cover it.
export const updateClinicSettingsSchema = Joi.object({
  bookingAheadDays: Joi.number()
    .integer()
    .min(MIN_BOOKING_AHEAD_DAYS)
    .max(MAX_PUBLIC_RANGE_DAYS)
    .messages({
      'number.base': ERRORS.invalidBookingAheadDays(MIN_BOOKING_AHEAD_DAYS, MAX_PUBLIC_RANGE_DAYS),
      'number.min': ERRORS.invalidBookingAheadDays(MIN_BOOKING_AHEAD_DAYS, MAX_PUBLIC_RANGE_DAYS),
      'number.max': ERRORS.invalidBookingAheadDays(MIN_BOOKING_AHEAD_DAYS, MAX_PUBLIC_RANGE_DAYS),
    }),
  reminderHour: Joi.number()
    .integer()
    .min(MIN_HOUR)
    .max(MAX_HOUR)
    .messages({
      'number.base': ERRORS.invalidReminderHour(MIN_HOUR, MAX_HOUR),
      'number.min': ERRORS.invalidReminderHour(MIN_HOUR, MAX_HOUR),
      'number.max': ERRORS.invalidReminderHour(MIN_HOUR, MAX_HOUR),
    }),
})
  .min(1)
  .messages({ 'object.min': ERRORS.SETTINGS_EMPTY_PATCH });
