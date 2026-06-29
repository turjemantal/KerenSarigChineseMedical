// One-time SEED values for the clinic-settings document. Used ONLY by the on-demand
// seed script (server/scripts/v2/seed-clinic-settings.ts) to provision the DB row — never
// by runtime app logic, which reads the live config from the DB and fails closed if it
// is absent. The mongosh initDB seed (migrations/init/seed.js) carries its own copy for
// fresh local volumes; keep the two in sync. This is the single TS definition.

// Initial booking horizon, in days (~6 months).
export const DEFAULT_BOOKING_AHEAD_DAYS = 183;

// Initial clinic-local hour (0–23) at which the daily appointment reminders go out.
export const DEFAULT_REMINDER_HOUR = 9;

// Bounds enforced on the admin-editable values.
export const MIN_BOOKING_AHEAD_DAYS = 1;
export const MIN_HOUR = 0;
export const MAX_HOUR = 23;
