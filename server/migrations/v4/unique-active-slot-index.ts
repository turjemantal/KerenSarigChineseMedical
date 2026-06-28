/**
 * Migration v4: enforce "no double-booking" at the database level.
 *
 * Creates a partial UNIQUE index on { date, time } scoped to ACTIVE (pending/scheduled)
 * appointments, so at most one active appointment can ever occupy a slot — even under
 * concurrent requests. Cancelled/rejected/completed/no-show appointments are excluded
 * from the filter, so a freed slot can be re-booked.
 *
 * Self-healing + idempotent: before building the index it finds any pre-existing
 * duplicate active slots (which would otherwise make a unique build fail) and resolves
 * each by keeping the earliest appointment active and demoting the rest to REJECTED.
 * Re-running after the index exists is a no-op.
 *
 * Run: npm run migrate   (auto-discovered by server/migrations/run.ts)
 */
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import mongoose from 'mongoose';
import { Appointment, AppointmentSchema } from '../../src/appointments/appointment.schema';
import { AppointmentStatus, ACTIVE_APPOINTMENT_STATUSES } from '../../src/common/enums/appointment-status.enum';

const INDEX_NAME = 'uniq_active_slot';

export async function up(): Promise<void> {
  const model = mongoose.models[Appointment.name]
    || mongoose.model(Appointment.name, AppointmentSchema);

  // 1. Resolve any existing duplicate active slots so the unique build can't fail.
  const dups = await model.aggregate<{ _id: { date: string; time: string }; ids: mongoose.Types.ObjectId[] }>([
    { $match: { status: { $in: ACTIVE_APPOINTMENT_STATUSES } } },
    { $sort: { createdAt: 1, _id: 1 } },
    { $group: { _id: { date: '$date', time: '$time' }, n: { $sum: 1 }, ids: { $push: '$_id' } } },
    { $match: { n: { $gt: 1 } } },
  ]);

  if (dups.length) {
    console.log(`  unique-active-slot: found ${dups.length} duplicate active slot(s) — keeping the earliest, rejecting the rest`);
    for (const d of dups) {
      const [, ...losers] = d.ids; // keep the first (earliest), demote the rest
      await model.updateMany({ _id: { $in: losers } }, { $set: { status: AppointmentStatus.REJECTED } });
      console.log(`    ${d._id.date} ${d._id.time}: rejected ${losers.length} duplicate(s)`);
    }
  } else {
    console.log('  unique-active-slot: no duplicate active slots found');
  }

  // 2. Create the partial unique index (idempotent — Mongo no-ops if it already exists).
  await model.collection.createIndex(
    { date: 1, time: 1 },
    {
      unique: true,
      partialFilterExpression: { status: { $in: ACTIVE_APPOINTMENT_STATUSES } },
      name: INDEX_NAME,
    },
  );
  console.log(`  unique-active-slot: index "${INDEX_NAME}" in place ✓`);
}
