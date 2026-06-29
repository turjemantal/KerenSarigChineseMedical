/**
 * One-off: seed the clinic-settings singleton.
 *
 * Clinic settings (booking horizon + reminder hour) are read DB-only by the app — it
 * never seeds them itself. Idempotent ($setOnInsert): inserts the document ONLY if none
 * exists, so it never overwrites settings the admin has changed. Seed values live in
 * clinic-settings.constants.ts. Needed once on a DB that predates DB-only settings.
 *
 *   npx ts-node --transpile-only scripts/v2/seed-clinic-settings.ts
 */
import mongoose from 'mongoose';
import { withDb } from '../_with-db';
import { ClinicSettings, ClinicSettingsSchema } from '../../src/clinic-settings/clinic-settings.schema';
import { DEFAULT_BOOKING_AHEAD_DAYS, DEFAULT_REMINDER_HOUR } from '../../src/common/constants/clinic-settings.constants';

withDb('seed clinic settings', async () => {
  const model = mongoose.models[ClinicSettings.name]
    || mongoose.model(ClinicSettings.name, ClinicSettingsSchema);
  const res = await model.updateOne(
    {},
    { $setOnInsert: { bookingAheadDays: DEFAULT_BOOKING_AHEAD_DAYS, reminderHour: DEFAULT_REMINDER_HOUR } },
    { upsert: true },
  );
  console.log(
    res.upsertedCount
      ? `  seeded (bookingAheadDays=${DEFAULT_BOOKING_AHEAD_DAYS}, reminderHour=${DEFAULT_REMINDER_HOUR})`
      : '  already present',
  );
});
