import { CLINIC_TIMEZONE } from '../constants/defaults.constants';
import { Weekday } from '../enums/weekday.enum';

const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

export function formatHebrewDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ב${HEB_MONTHS[month - 1]} ${year}`;
}

// The server may run in any timezone (UTC in Docker) — clinic-time helpers keep
// "today"/"now" anchored to the clinic's local clock in Israel.

// YYYY-MM-DD of the current date at the clinic
export function clinicToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TIMEZONE }).format(new Date());
}

// HH:MM of the current time at the clinic
export function clinicTimeNow(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

// Weekday of a YYYY-MM-DD calendar date (timezone-independent)
export function weekdayOf(dateStr: string): Weekday {
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay() as Weekday;
}
