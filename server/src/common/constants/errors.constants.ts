// Centralized error messages — keep all user-facing error text here, never inline.

export enum Entity {
  Appointment = 'Appointment',
  Lead = 'Lead',
  ScheduleBlock = 'Schedule block',
  Client = 'Client',
}

export const notFoundMessage = (entity: Entity, id: string): string => `${entity} ${id} not found`;

export const ERRORS = {
  // formats
  INVALID_DATE_FORMAT: 'תאריך לא תקין — נדרש פורמט YYYY-MM-DD',
  INVALID_TIME_FORMAT: 'שעה לא תקינה — נדרש פורמט HH:MM',
  INVALID_PHONE: 'מספר טלפון לא תקין — אנא הזינו מספר ישראלי תקין (05X-XXXXXXX)',
  INVALID_EMAIL: 'כתובת אימייל לא תקינה',
  INVALID_STATUS: 'סטטוס לא תקין',
  OTP_DIGITS_ONLY: 'קוד האימות חייב להכיל ספרות בלבד',

  // required fields
  REQUIRED_DATE: 'תאריך הוא שדה חובה',
  REQUIRED_TIME: 'שעה היא שדה חובה',
  REQUIRED_START_DATE: 'תאריך התחלה הוא שדה חובה',
  REQUIRED_NAME: 'שם הוא שדה חובה',
  REQUIRED_PHONE: 'טלפון הוא שדה חובה',
  REQUIRED_PASSWORD: 'סיסמה היא שדה חובה',
  REQUIRED_OTP: 'קוד אימות הוא שדה חובה',
  REQUIRED_CONCERN: 'תיאור הבעיה הוא שדה חובה',

  // lengths
  nameMinLength: (min: number) => `שם חייב להכיל לפחות ${min} תווים`,
  nameMaxLength: (max: number) => `שם לא יכול לעלות על ${max} תווים`,
  concernMinLength: (min: number) => `אנא תארו את הבעיה ב-${min} תווים לפחות`,
  concernMaxLength: (max: number) => `תיאור הבעיה לא יכול לעלות על ${max} תווים`,
  otpLength: (len: number) => `קוד האימות חייב להכיל ${len} ספרות`,

  // ranges
  INVALID_DATE_RANGE: 'טווח תאריכים לא תקין',
  END_DATE_BEFORE_START: 'תאריך סיום חייב להיות אחרי תאריך התחלה',
  END_TIME_BEFORE_START: 'שעת סיום חייבת להיות אחרי שעת התחלה',
  TIMES_REQUIRE_BOTH: 'יש לציין גם שעת התחלה וגם שעת סיום',
  dateRangeTooLarge: (maxDays: number) => `טווח התאריכים מוגבל ל-${maxDays} ימים`,

  // domain
  SLOT_BLOCKED: 'המועד שנבחר אינו זמין — הקליניקה סגורה בשעות אלו',
  DATE_IN_PAST: 'לא ניתן לקבוע תור לתאריך שעבר',
  TIME_IN_PAST: 'לא ניתן לקבוע תור לשעה שכבר עברה',
  CLOSED_WEEKDAY: 'הקליניקה סגורה ביום זה',

  // auth
  WRONG_PASSWORD: 'סיסמה שגויה',
  INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
  ADMIN_ACCESS_REQUIRED: 'Admin access required',
} as const;
