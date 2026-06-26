/**
 * Migration v3: backfill existing SCHEDULED appointments into Google Calendar.
 *
 * Idempotent — skips any appointment that already has a googleCalendarEventId.
 * Skips entirely when GOOGLE_CALENDAR_CREDENTIALS / GOOGLE_CALENDAR_ID are not
 * set (calendar integration not yet configured for this environment).
 *
 * Run: npm run migrate   (auto-discovered by server/migrations/run.ts)
 */
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(process.cwd(), '../.env'), quiet: true });

import mongoose from 'mongoose';
import { auth as googleAuth, calendar } from '@googleapis/calendar';
import { Appointment, AppointmentSchema } from '../../src/appointments/appointment.schema';
import { AppointmentStatus } from '../../src/common/enums/appointment-status.enum';
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_TIMEZONE, CALENDAR_EVENT_DURATION_MINUTES } from '../../src/common/constants/defaults.constants';

function buildEventDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function addMinutes(date: string, time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return buildEventDateTime(date, endTime);
}

export async function up(): Promise<void> {
  const credentials = process.env.GOOGLE_CALENDAR_CREDENTIALS;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!credentials || !calendarId) {
    console.log('  google-calendar backfill: skipped (GOOGLE_CALENDAR_CREDENTIALS / GOOGLE_CALENDAR_ID not set)');
    return;
  }

  const calendarAuth = new googleAuth.GoogleAuth({
    credentials: JSON.parse(credentials) as object,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendarClient = calendar({ version: 'v3', auth: calendarAuth });

  const model = mongoose.models[Appointment.name]
    || mongoose.model(Appointment.name, AppointmentSchema);

  const pending = await model
    .find({ status: AppointmentStatus.SCHEDULED, googleCalendarEventId: { $exists: false } })
    .exec();

  console.log(`  google-calendar backfill: found ${pending.length} appointment(s) to sync`);
  if (pending.length === 0) return;

  let synced = 0;
  let failed = 0;

  for (const appt of pending) {
    const descriptionLines = [`שם: ${appt.name}`];
    if (appt.treatment) descriptionLines.push(`טיפול: ${appt.treatment}`);
    if (appt.concern) descriptionLines.push(`פנייה: ${appt.concern}`);
    if (appt.notes) descriptionLines.push(`הערות: ${appt.notes}`);

    try {
      const res = await calendarClient.events.insert({
        calendarId,
        requestBody: {
          summary: `תור - ${CLINIC_NAME}`,
          location: CLINIC_ADDRESS,
          description: descriptionLines.join('\n'),
          start: { dateTime: buildEventDateTime(appt.date, appt.time), timeZone: CLINIC_TIMEZONE },
          end: { dateTime: addMinutes(appt.date, appt.time, CALENDAR_EVENT_DURATION_MINUTES), timeZone: CLINIC_TIMEZONE },
        },
      });
      const eventId = res.data.id;
      if (eventId) {
        await model.findByIdAndUpdate(appt._id, { googleCalendarEventId: eventId });
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  console.log(`  google-calendar backfill: synced=${synced} failed=${failed}`);
}
