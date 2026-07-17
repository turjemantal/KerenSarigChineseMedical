/**
 * One-off: backfill existing SCHEDULED and PENDING appointments into Google Calendar.
 *
 * Idempotent — skips any appointment that already has a googleCalendarEventId. Skips
 * entirely when GOOGLE_CALENDAR_CREDENTIALS / GOOGLE_CALENDAR_ID are not set (calendar
 * integration not configured for this environment). Run once after enabling the
 * service-account calendar sync, or again after the pending-request sync change to
 * pick up any pending requests that never got an event.
 *
 *   APP_ENV=PROD MONGODB_URI='<prod-uri>' npx ts-node --transpile-only scripts/v3/backfill-google-calendar.ts
 */
import mongoose from 'mongoose';
import { auth as googleAuth, calendar } from '@googleapis/calendar';
import { withDb } from '../_with-db';
import { Appointment, AppointmentSchema } from '../../src/appointments/appointment.schema';
import { AppointmentStatus } from '../../src/common/enums/appointment-status.enum';
import {
  CLINIC_ADDRESS,
  CLINIC_TIMEZONE,
  CALENDAR_EVENT_DURATION_MINUTES,
  CALENDAR_EVENT_SUMMARY,
  CALENDAR_EVENT_SUMMARY_PENDING,
} from '../../src/common/constants/defaults.constants';

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

withDb('backfill google calendar', async () => {
  const credentials = process.env.GOOGLE_CALENDAR_CREDENTIALS;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!credentials || !calendarId) {
    console.log('  skipped (GOOGLE_CALENDAR_CREDENTIALS / GOOGLE_CALENDAR_ID not set)');
    return;
  }

  const calendarAuth = new googleAuth.GoogleAuth({
    credentials: JSON.parse(credentials) as object,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendarClient = calendar({ version: 'v3', auth: calendarAuth });

  const model = mongoose.models[Appointment.name]
    || mongoose.model(Appointment.name, AppointmentSchema);

  const toSync = await model
    .find({
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.PENDING] },
      googleCalendarEventId: { $exists: false },
    })
    .exec();

  console.log(`  found ${toSync.length} appointment(s) to sync`);
  if (toSync.length === 0) return;

  let synced = 0;
  let failed = 0;

  for (const appt of toSync) {
    const descriptionLines = [`שם: ${appt.name}`];
    if (appt.treatment) descriptionLines.push(`טיפול: ${appt.treatment}`);
    if (appt.concern) descriptionLines.push(`פנייה: ${appt.concern}`);
    if (appt.notes) descriptionLines.push(`הערות: ${appt.notes}`);

    try {
      const res = await calendarClient.events.insert({
        calendarId,
        requestBody: {
          summary: appt.status === AppointmentStatus.PENDING ? CALENDAR_EVENT_SUMMARY_PENDING : CALENDAR_EVENT_SUMMARY,
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

  console.log(`  synced=${synced} failed=${failed}`);
});
