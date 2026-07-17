// Nightly cron hour: past scheduled appointments are auto-completed at this time.
// Running at 23:00 gives Keren the full working day to mark no-shows first.
export const AUTO_COMPLETE_HOUR = 23;

// A client may reschedule or cancel for free up to this many hours before the
// appointment. Inside this window the server rejects a reschedule (and the client
// is warned about a possible charge on cancellation).
export const FREE_CANCELLATION_HOURS = 24;

// Length of a single appointment slot. Two bookable times on the same date must be
// at least this far apart — enforced when computing availability (a taken time
// blocks any candidate within this window), when saving the weekly schedule
// (adjacent day times must be spaced this far apart), and when opening an extra
// slot (must not land within this window of a base time or another extra slot).
export const APPOINTMENT_DURATION_MINUTES = 45;
