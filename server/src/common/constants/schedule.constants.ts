// Nightly cron hour: past scheduled appointments are auto-completed at this time.
// Running at 23:00 gives Keren the full working day to mark no-shows first.
export const AUTO_COMPLETE_HOUR = 23;

// A client may reschedule or cancel for free up to this many hours before the
// appointment. Inside this window the server rejects a reschedule (and the client
// is warned about a possible charge on cancellation).
export const FREE_CANCELLATION_HOURS = 24;

// Length of a single appointment — the ONE duration in the system. Everything reads it:
// availability (a taken time blocks any candidate within this window), a timed schedule
// block (closes any slot whose window overlaps it), saving the weekly schedule (adjacent
// day times must be spaced this far apart), opening an extra slot (must not land within
// this window of a base time or another extra slot), the Google Calendar event length,
// and the duration shown to clients. Never restate the number anywhere — derive it from
// here (including in user-facing error text), or the copies drift apart.
export const APPOINTMENT_DURATION_MINUTES = 50;
