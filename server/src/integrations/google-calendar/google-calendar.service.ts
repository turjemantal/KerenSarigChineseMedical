import { Injectable, Logger } from '@nestjs/common';
import { auth, calendar } from '@googleapis/calendar';
import { AppointmentDocument } from '../../appointments/appointment.schema';
import { config } from '../../config';
import {
  CLINIC_ADDRESS,
  CLINIC_TIMEZONE,
  CALENDAR_EVENT_SUMMARY,
  CALENDAR_EVENT_SUMMARY_PENDING,
} from '../../common/constants/defaults.constants';
import { APPOINTMENT_DURATION_MINUTES } from '../../common/constants/schedule.constants';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  private isConfigured(): boolean {
    return !!(config.googleCalendar.credentials && config.googleCalendar.calendarId);
  }

  private getCalendarClient() {
    const credentials = JSON.parse(config.googleCalendar.credentials) as object;
    const googleAuth = new auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    return calendar({ version: 'v3', auth: googleAuth });
  }

  private buildEventDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private addMinutes(date: string, time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    return this.buildEventDateTime(date, endTime);
  }

  private buildEventBody(appt: AppointmentDocument) {
    const descriptionLines = [`שם: ${appt.name}`];
    if (appt.treatment) descriptionLines.push(`טיפול: ${appt.treatment}`);
    if (appt.concern) descriptionLines.push(`פנייה: ${appt.concern}`);
    if (appt.notes) descriptionLines.push(`הערות: ${appt.notes}`);

    return {
      summary: appt.status === AppointmentStatus.PENDING ? CALENDAR_EVENT_SUMMARY_PENDING : CALENDAR_EVENT_SUMMARY,
      location: CLINIC_ADDRESS,
      description: descriptionLines.join('\n'),
      start: {
        dateTime: this.buildEventDateTime(appt.date, appt.time),
        timeZone: CLINIC_TIMEZONE,
      },
      end: {
        dateTime: this.addMinutes(appt.date, appt.time, APPOINTMENT_DURATION_MINUTES),
        timeZone: CLINIC_TIMEZONE,
      },
    };
  }

  async createEvent(appt: AppointmentDocument): Promise<string | null> {
    if (!this.isConfigured()) return null;
    try {
      const calendar = this.getCalendarClient();
      const res = await calendar.events.insert({
        calendarId: config.googleCalendar.calendarId,
        requestBody: this.buildEventBody(appt),
      });
      return res.data.id ?? null;
    } catch (e) {
      this.logger.warn(`[Calendar] createEvent failed: ${e}`);
      return null;
    }
  }

  async updateEvent(eventId: string, appt: AppointmentDocument): Promise<void> {
    if (!this.isConfigured() || !eventId) return;
    try {
      const calendar = this.getCalendarClient();
      await calendar.events.update({
        calendarId: config.googleCalendar.calendarId,
        eventId,
        requestBody: this.buildEventBody(appt),
      });
    } catch (e) {
      this.logger.warn(`[Calendar] updateEvent failed eventId=${eventId}: ${e}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isConfigured() || !eventId) return;
    try {
      const calendar = this.getCalendarClient();
      await calendar.events.delete({
        calendarId: config.googleCalendar.calendarId,
        eventId,
      });
    } catch (e) {
      this.logger.warn(`[Calendar] deleteEvent failed eventId=${eventId}: ${e}`);
    }
  }
}
