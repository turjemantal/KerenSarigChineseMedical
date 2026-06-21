// Nightly cron hour: past scheduled appointments are auto-completed at this time.
// Running at 23:00 gives Keren the full working day to mark no-shows first.
export const AUTO_COMPLETE_HOUR = 23;

// A client may reschedule or cancel for free up to this many hours before the
// appointment. Inside this window the server rejects a reschedule (and the client
// is warned about a possible charge on cancellation).
export const FREE_CANCELLATION_HOURS = 24;
