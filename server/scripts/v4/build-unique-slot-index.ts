/**
 * One-off: enforce "no double-booking" at the database level.
 *
 * Creates a partial UNIQUE index on { date, time } scoped to ACTIVE (pending/scheduled)
 * appointments, so at most one active appointment can ever occupy a slot — even under
 * concurrent requests. Cancelled/rejected/completed/no-show are excluded, so a freed
 * slot can be re-booked.
 *
 * Self-healing + idempotent: first resolves any pre-existing duplicate active slots
 * (which would make a unique build fail) by keeping the earliest and demoting the rest
 * to REJECTED, then builds the index. Re-running once the index exists is a no-op.
 *
 *   npx ts-node --transpile-only scripts/v4/build-unique-slot-index.ts            # local
 *   APP_ENV=PROD MONGODB_URI='<prod-uri>' npx ts-node --transpile-only scripts/v4/build-unique-slot-index.ts   # prod
 */
import mongoose from 'mongoose';
import { withDb } from '../_with-db';
import { Appointment, AppointmentSchema } from '../../src/appointments/appointment.schema';
import { AppointmentStatus, ACTIVE_APPOINTMENT_STATUSES } from '../../src/common/enums/appointment-status.enum';

const INDEX_NAME = 'uniq_active_slot';

withDb('build unique-active-slot index', async () => {
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
    console.log(`  found ${dups.length} duplicate active slot(s) — keeping the earliest, rejecting the rest`);
    for (const d of dups) {
      const [, ...losers] = d.ids; // keep the first (earliest), demote the rest
      await model.updateMany({ _id: { $in: losers } }, { $set: { status: AppointmentStatus.REJECTED } });
      console.log(`    ${d._id.date} ${d._id.time}: rejected ${losers.length} duplicate(s)`);
    }
  } else {
    console.log('  no duplicate active slots found');
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
  console.log(`  index "${INDEX_NAME}" in place ✓`);
});
