/**
 * One-time, idempotent migration: seed the clinic-settings document into the DB.
 *
 * Clinic settings (booking horizon + reminder hour) are read DB-only by the app — it
 * never seeds them itself. This migration provisions the singleton settings document.
 * It inserts the document ONLY if none exists ($setOnInsert), so it:
 *   - NEVER overwrites settings the admin has already changed,
 *   - is safe to re-run (an existing document is left untouched).
 *
 * Run it against the target DB BEFORE the DB-only code serves traffic. The seed values
 * live in clinic-settings.constants.ts (the single TS definition) — a migration
 * artifact, not part of the runtime app logic.
 *
 * Usage: npm run seed:clinic-settings   (or npm run migrate for all seeds)
 *   (MONGODB_URI comes from the environment / root .env, like the server.)
 */
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import mongoose from 'mongoose';
import { ClinicSettings, ClinicSettingsSchema } from '../../src/clinic-settings/clinic-settings.schema';
import { DEFAULT_BOOKING_AHEAD_DAYS, DEFAULT_REMINDER_HOUR } from '../../src/common/constants/clinic-settings.constants';
import { LOCAL_DB_HOSTS, MONGODB_SRV_PREFIX, MONGODB_PREFIX } from '../../src/common/constants/database.constants';
import { AppEnv } from '../../src/common/enums/app-env.enum';

// Mirror main.ts: a non-PROD run may only touch a local DB, so this can never
// accidentally seed production from a developer's machine.
function dbHostIsLocal(uri: string): boolean {
  if (uri.startsWith(MONGODB_SRV_PREFIX)) return false;
  let host = '';
  try {
    host = new URL(uri).hostname;
  } catch {
    host = uri.replace(MONGODB_PREFIX, '').replace(/.*@/, '').split(/[:/?,]/)[0];
  }
  return (LOCAL_DB_HOSTS as readonly string[]).includes(host);
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/keren-clinic';
  const isProd = process.env.APP_ENV === AppEnv.Prod;
  if (!isProd && !dbHostIsLocal(uri)) {
    console.error('[Safety] Refusing to seed a remote DB outside PROD. Use a local database.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const model = mongoose.model(ClinicSettings.name, ClinicSettingsSchema);

  const res = await model.updateOne(
    {},
    { $setOnInsert: { bookingAheadDays: DEFAULT_BOOKING_AHEAD_DAYS, reminderHour: DEFAULT_REMINDER_HOUR } },
    { upsert: true },
  );

  console.log(
    res.upsertedCount
      ? `✅ Clinic settings seeded: bookingAheadDays=${DEFAULT_BOOKING_AHEAD_DAYS} reminderHour=${DEFAULT_REMINDER_HOUR}.`
      : '✅ Clinic settings already present — nothing to do.',
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Clinic settings seed failed:', err);
  process.exit(1);
});
