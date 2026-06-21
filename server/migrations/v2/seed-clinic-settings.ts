/**
 * Migration v2: seed the clinic-settings document.
 *
 * Clinic settings (booking horizon + reminder hour) are read DB-only by the app — it
 * never seeds them itself. Idempotent ($setOnInsert): inserts the singleton document
 * ONLY if none exists, so it never overwrites settings the admin has changed. Exposes
 * `up()` for the runner (server/migrations/run.ts). The seed values live in
 * clinic-settings.constants.ts (the single TS definition).
 */
import mongoose from 'mongoose';
import { ClinicSettings, ClinicSettingsSchema } from '../../src/clinic-settings/clinic-settings.schema';
import { DEFAULT_BOOKING_AHEAD_DAYS, DEFAULT_REMINDER_HOUR } from '../../src/common/constants/clinic-settings.constants';

export async function up(): Promise<void> {
  const model = mongoose.models[ClinicSettings.name]
    || mongoose.model(ClinicSettings.name, ClinicSettingsSchema);
  const res = await model.updateOne(
    {},
    { $setOnInsert: { bookingAheadDays: DEFAULT_BOOKING_AHEAD_DAYS, reminderHour: DEFAULT_REMINDER_HOUR } },
    { upsert: true },
  );
  console.log(
    res.upsertedCount
      ? `  clinic settings: seeded (bookingAheadDays=${DEFAULT_BOOKING_AHEAD_DAYS}, reminderHour=${DEFAULT_REMINDER_HOUR})`
      : '  clinic settings: already present',
  );
}
