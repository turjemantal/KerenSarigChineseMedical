import { URLSearchParams } from 'url';
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_TIMEZONE, CALENDAR_EVENT_DURATION_MINUTES } from '../common/constants/defaults.constants';

function formatDateTime(date: string, time: string): string {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
}

function addMinutes(date: string, time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return formatDateTime(date, `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
}

// Patient name and concern are intentionally excluded — this URL is public (shared via SMS link).
export function buildGoogleCalendarUrl(date: string, time: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `תור - ${CLINIC_NAME}`,
    dates: `${formatDateTime(date, time)}/${addMinutes(date, time, CALENDAR_EVENT_DURATION_MINUTES)}`,
    ctz: CLINIC_TIMEZONE,
    location: CLINIC_ADDRESS,
    details: `טיפול בקליניקת ${CLINIC_NAME}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
