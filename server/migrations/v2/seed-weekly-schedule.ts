/**
 * Migration v2: seed the base weekly schedule.
 *
 * Idempotent, per-day ($setOnInsert): inserts a default row only for a weekday that has
 * no row yet — it NEVER overwrites a day the admin already customised. Exposes `up()`
 * for the runner (server/migrations/run.ts), which owns the connection + safety guard.
 * The default values live here only — a migration artifact, not runtime app logic.
 */
import mongoose from 'mongoose';
import { WeeklyScheduleDay, WeeklyScheduleDaySchema } from '../../src/weekly-schedule/weekly-schedule.schema';

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

export async function up(): Promise<void> {
  const model = mongoose.models[WeeklyScheduleDay.name]
    || mongoose.model(WeeklyScheduleDay.name, WeeklyScheduleDaySchema);
  let seeded = 0;
  for (const [weekday, times] of Object.entries(SEED)) {
    const res = await model.updateOne(
      { weekday: Number(weekday) },
      { $setOnInsert: { weekday: Number(weekday), times } },
      { upsert: true },
    );
    if (res.upsertedCount) seeded++;
  }
  console.log(`  weekly schedule: ${seeded} day(s) added, ${7 - seeded} already present`);
}
