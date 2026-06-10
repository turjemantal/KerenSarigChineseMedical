import { formatHebrewDate } from '../utils/date.utils';
import { CLINIC_NAME } from './defaults.constants';
import { OTP_EXPIRY_MINUTES } from './otp.constants';

// ─── WhatsApp template parameter builders ────────────────────────────────────
// otp_code template: {{1}} = code
export const otpParams = (code: string): string[] => [code];

// booking_confirmation template: {{1}} = first name, {{2}} = date, {{3}} = time
export const bookingParams = (name: string, date: string, time: string): string[] =>
  [name.split(' ')[0], formatHebrewDate(date), time];

// booking_request template: {{1}} = first name, {{2}} = date, {{3}} = time
export const bookingRequestParams = bookingParams;

// appointment_reminder template: {{1}} = time
export const reminderParams = (time: string): string[] => [time];

// ─── SMS plain-text message builders ─────────────────────────────────────────
export const smsOtpText = (code: string): string =>
  `קוד האימות שלך הוא: ${code}. הקוד תקף ל-${OTP_EXPIRY_MINUTES} דקות.`;

export const smsBookingText = (name: string, date: string, time: string): string =>
  `שלום ${name.split(' ')[0]}, התור שלך ב${formatHebrewDate(date)} בשעה ${time} אושר. ${CLINIC_NAME}`;

export const smsBookingRequestText = (name: string, date: string, time: string): string =>
  `שלום ${name.split(' ')[0]}, בקשתך לתור ב${formatHebrewDate(date)} בשעה ${time} התקבלה וממתינה לאישור. נעדכן ברגע שהתור יאושר. ${CLINIC_NAME}`;

export const smsReminderText = (time: string): string =>
  `תזכורת: יש לך תור מחר בשעה ${time}. ${CLINIC_NAME}`;
