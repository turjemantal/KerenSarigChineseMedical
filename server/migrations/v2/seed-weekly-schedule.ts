/**
 * One-time, idempotent migration: seed the base weekly schedule into the DB.
 *
 * The weekly schedule used to be a hardcoded constant that the DB overrode per day.
 * It is now sourced entirely from the DB, so the base values must be seeded — or the
 * clinic would show zero availability. This script inserts a default row for any
 * weekday that has no row yet ($setOnInsert), so it:
 *   - NEVER overwrites a day the admin already customised (those rows stay as-is),
 *   - fills in the remaining days with the historical defaults,
 *   - is safe to re-run (already-present days are skipped).
 *
 * Run it against the target DB BEFORE the DB-only code serves traffic. The default
 * values live here only — a migration artifact, not part of the runtime app logic.
 *
 * Usage: npm run seed:weekly-schedule   (or npm run migrate for all seeds)
 *   (MONGODB_URI comes from the environment / root .env, like the server.)
 */
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import mongoose from 'mongoose';
import { WeeklyScheduleDay, WeeklyScheduleDaySchema } from '../../src/weekly-schedule/weekly-schedule.schema';
import { LOCAL_DB_HOSTS, MONGODB_SRV_PREFIX, MONGODB_PREFIX } from '../../src/common/constants/database.constants';
import { AppEnv } from '../../src/common/enums/app-env.enum';

// Historical base schedule (0=Sunday … 6=Saturday). Empty = clinic closed that day.
const MON_WED = ['09:00', '10:15', '11:45', '14:30', '15:45', '17:00', '18:15'];
const TUE_THU = ['08:50', '10:00', '11:30'];
const SEED: Record<number, string[]> = {
  0: [],
  1: MON_WED,
  2: TUE_THU,
  3: MON_WED,
  4: TUE_THU,
  5: ['08:50', '10:00', '11:30', '12:45'],
  6: [],
};

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
  const model = mongoose.model(WeeklyScheduleDay.name, WeeklyScheduleDaySchema);

  let seeded = 0;
  for (const [weekday, times] of Object.entries(SEED)) {
    const wd = Number(weekday);
    const res = await model.updateOne(
      { weekday: wd },
      { $setOnInsert: { weekday: wd, times } },
      { upsert: true },
    );
    if (res.upsertedCount) seeded++;
  }

  console.log(`✅ Weekly schedule seed complete: ${seeded} day(s) added, ${7 - seeded} already present.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Weekly schedule seed failed:', err);
  process.exit(1);
});
