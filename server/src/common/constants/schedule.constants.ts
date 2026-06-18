import { Weekday } from '../enums/weekday.enum';

// Base weekly schedule — the bookable start times offered on each weekday.
// An empty list means the clinic is closed that day. Keren can still open
// additional one-off slots on a specific date (extra slots), and can close
// hours/days via schedule blocks — both are layered on top of this base.
const MON_WED = ['09:00', '10:15', '11:45', '14:30', '15:45', '17:00', '18:15'];
const TUE_THU = ['08:50', '10:00', '11:30'];

// Clients can book at most this many days ahead (a rolling ~1 month window).
export const MAX_BOOKING_AHEAD_DAYS = 30;

// Daily appointment reminders go out at this clinic-local hour, for the next day's
// confirmed appointments. The cron is pinned to CLINIC_TIMEZONE (not the container's
// UTC) so "09:00" and "tomorrow" always mean clinic time.
export const DAILY_REMINDER_HOUR = 9;

// Nightly cron hour: past scheduled appointments are auto-completed at this time.
// Running at 23:00 gives Keren the full working day to mark no-shows first.
export const AUTO_COMPLETE_HOUR = 23;

// A client may reschedule or cancel for free up to this many hours before the
// appointment. Inside this window the server rejects a reschedule (and the client
// is warned about a possible charge on cancellation).
export const FREE_CANCELLATION_HOURS = 24;

export const WEEKLY_SCHEDULE: Record<Weekday, string[]> = {
  [Weekday.SUNDAY]: [],
  [Weekday.MONDAY]: MON_WED,
  [Weekday.TUESDAY]: TUE_THU,
  [Weekday.WEDNESDAY]: MON_WED,
  [Weekday.THURSDAY]: TUE_THU,
  [Weekday.FRIDAY]: ['08:50', '10:00', '11:30', '12:45'],
  [Weekday.SATURDAY]: [],
};
