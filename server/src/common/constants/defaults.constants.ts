
export const CLINIC_NAME = 'קליניקת קרן שריג';
export const CLINIC_ADDRESS = 'סוקולוב 40, רמת השרון, קומה 3';
export const ISRAEL_COUNTRY_CODE = '972';
export const CLINIC_TIMEZONE = 'Asia/Jerusalem';

export const DEFAULT_SOURCE = 'אתר';
export const ADMIN_SOURCE = 'ניהול';
export const DEFAULT_APPOINTMENT_TREATMENT = 'טיפול משולב של דיקור ומגע וטכניקות נוספות כמו כוסות רוח והקזות';
export const DEFAULT_LEAD_TREATMENT = 'ייעוץ ראשוני';

// A calendar event lasts exactly as long as the appointment it mirrors — there is one
// duration in the system (APPOINTMENT_DURATION_MINUTES in schedule.constants), not a
// second copy here. A separate value used to drift from it, so events could overlap the
// very slots the availability rules had deliberately kept apart.
export const CALENDAR_EVENT_SUMMARY = `תור - ${CLINIC_NAME}`;
export const CALENDAR_EVENT_SUMMARY_PENDING = `תור (ממתין לאישור) - ${CLINIC_NAME}`;
