import { formatHebrewDate } from '../utils/date.utils';
import { CLINIC_ADDRESS, CLINIC_NAME } from './defaults.constants';
import { OTP_EXPIRY_MINUTES } from './otp.constants';

// ─── WhatsApp template parameter builders ────────────────────────────────────
// otp_code template: {{1}} = code
export const otpParams = (code: string): string[] => [code];

// booking_confirmation template: {{1}} = first name, {{2}} = date, {{3}} = time
export const bookingParams = (name: string, date: string, time: string): string[] =>
  [name.split(' ')[0], formatHebrewDate(date), time];

// booking_request template: {{1}} = first name, {{2}} = date, {{3}} = time
export const bookingRequestParams = bookingParams;

// booking_rejected template: {{1}} = first name, {{2}} = date, {{3}} = time
export const bookingRejectedParams = bookingParams;

// booking_cancelled template: {{1}} = first name, {{2}} = date, {{3}} = time
export const bookingCancelledParams = bookingParams;

// appointment_reminder template: {{1}} = time, {{2}} = clinic address
export const reminderParams = (time: string): string[] => [time, CLINIC_ADDRESS];

// ─── SMS plain-text message builders ─────────────────────────────────────────
// The `\n\n@domain #code` footer enables Web OTP API autofill (Chrome Android,
// Samsung Internet) and iOS Safari's domain-matched OTP suggestion.
// Only appended for real domains — localhost and bare IPs trigger iOS's
// domain-matching mode and suppress the suggestion when the origin doesn't match.
export const isRealDomain = (domain: string): boolean =>
  domain !== 'localhost' && !/^\d{1,3}(\.\d{1,3}){3}$/.test(domain);

export const smsOtpText = (code: string, domain: string): string => {
  const base = `קוד האימות שלך הוא: ${code}. הקוד תקף ל-${OTP_EXPIRY_MINUTES} דקות.`;
  return isRealDomain(domain) ? `${base}\n\n@${domain} #${code}` : base;
};

export const smsBookingText = (name: string, date: string, time: string): string =>
  `שלום ${name.split(' ')[0]}, התור שלך ב${formatHebrewDate(date)} בשעה ${time} אושר. ${CLINIC_NAME}`;

export const smsBookingRequestText = (name: string, date: string, time: string): string =>
  `שלום ${name.split(' ')[0]}, בקשתך לתור ב${formatHebrewDate(date)} בשעה ${time} התקבלה וממתינה לאישור. נעדכן ברגע שהתור יאושר. ${CLINIC_NAME}`;

export const smsReminderText = (time: string): string =>
  `תזכורת: יש לך תור מחר בשעה ${time}, בכתובת ${CLINIC_ADDRESS}. ${CLINIC_NAME}`;

export const smsBookingRejectedText = (name: string, date: string, time: string): string =>
  `שלום ${name.split(' ')[0]}, לצערנו לא נוכל לקבל את בקשתך לתור ב${formatHebrewDate(date)} בשעה ${time}. נשמח לעזור במועד אחר — ניתן לקבוע מחדש או ליצור קשר. ${CLINIC_NAME}`;

export const smsBookingCancelledText = (name: string, date: string, time: string): string =>
  `שלום ${name.split(' ')[0]}, התור שלך ב${formatHebrewDate(date)} בשעה ${time} בוטל. לקביעת תור חדש ניתן להיכנס לאתר. ${CLINIC_NAME}`;

// admin alert — sent to the clinic owner when a new booking arrives
export const smsNewBookingAlertText = (name: string, date: string, time: string): string =>
  `תור חדש ממתין לאישור: ${name}, ${formatHebrewDate(date)} בשעה ${time}. לאישור: היכנסי לממשק הניהול.`;

// new_booking_alert template: {{1}} = name, {{2}} = date, {{3}} = time
export const newBookingAlertParams = bookingParams;

// admin alert — sent to the clinic owner when an appointment is cancelled (by her or
// by the client), so a freed-up slot doesn't go unnoticed until she opens the dashboard
export const smsCancellationAlertText = (name: string, date: string, time: string): string =>
  `תור בוטל: ${name}, ${formatHebrewDate(date)} בשעה ${time}. המועד התפנה ביומן.`;

// cancellation_alert template: {{1}} = name, {{2}} = date, {{3}} = time
export const cancellationAlertParams = bookingParams;

// admin alert — sent to the clinic owner when a new lead arrives from the website
export const smsNewLeadAlertText = (name: string, phone: string, concern: string): string =>
  `ליד חדש מהאתר: ${name} (${phone}). פנייה: ${concern}. למעקב: היכנסי לממשק הניהול.`;

// lead_alert template: {{1}} = name, {{2}} = phone, {{3}} = concern
export const leadAlertParams = (name: string, phone: string, concern: string): string[] =>
  [name, phone, concern];
