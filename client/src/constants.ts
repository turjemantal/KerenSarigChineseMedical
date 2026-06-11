// Shared domain constants — mirror server enums (server/src/common/enums)

export const AppointmentStatus = {
  Pending: 'pending',
  Scheduled: 'scheduled',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'noshow',
} as const
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus]

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Pending]: 'ממתין לאישור',
  [AppointmentStatus.Scheduled]: 'מאושר',
  [AppointmentStatus.Completed]: 'הושלם',
  [AppointmentStatus.Cancelled]: 'בוטל',
  [AppointmentStatus.NoShow]: 'לא הגיע',
}

export const LeadStatus = {
  New: 'new',
  Contacted: 'contacted',
  Booked: 'booked',
  Closed: 'closed',
} as const
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.New]: 'חדש',
  [LeadStatus.Contacted]: 'בקשר',
  [LeadStatus.Booked]: 'נקבע',
  [LeadStatus.Closed]: 'סגור',
}

export const APPOINTMENT_DURATION_MINUTES = 50

// bookable slot grid, grouped by period of day
export const SLOT_PERIODS: Record<string, string[]> = {
  בוקר: ['09:00', '09:45', '10:30', '11:15'],
  'אחה״צ': ['13:30', '14:15', '15:00', '15:45', '16:30'],
  ערב: ['17:15', '18:00'],
}

// mirrors server PHONE_REGEX (validation.constants.ts)
export const PHONE_REGEX = /^05\d{8}$/

// weekdays the clinic is closed (0=Sunday … 6=Saturday) — mirrors server CLOSED_WEEKDAYS
export const CLOSED_WEEKDAYS: number[] = [6]

// public media bucket (S3) — configured via VITE_MEDIA_BASE_URL in the root .env;
// empty value gracefully hides media that depends on it (e.g. testimonial videos)
export const MEDIA_BASE_URL: string = import.meta.env.VITE_MEDIA_BASE_URL ?? ''

// clinic contact + social profiles — single source for nav, footer, and legal pages
export const CLINIC_CONTACT = {
  phone: '050-9031503',
  phoneIntl: '+972509031503',
  email: 'karintip1@gmail.com',
  address: 'סוקולוב 40, רמת השרון, קומה 3',
} as const

export const SOCIAL_LINKS = [
  { id: 'instagram', label: 'אינסטגרם', href: 'https://www.instagram.com/kerensarig11/', icon: 'Instagram' },
  { id: 'facebook', label: 'פייסבוק', href: 'https://www.facebook.com/kerensarighealth', icon: 'Facebook' },
  { id: 'whatsapp', label: 'וואטסאפ', href: 'https://wa.me/972509031503', icon: 'Whatsapp' },
] as const

// user-facing error messages — keep all error copy here, never inline
export const UI_ERRORS = {
  INVALID_PHONE: 'אנא הזינו מספר טלפון ישראלי תקין (05X-XXXXXXX)',
  OTP_SEND_FAILED: 'שגיאה בשליחת הקוד, נסו שוב',
  OTP_WRONG: 'הקוד שגוי, נסו שוב',
  GENERIC: 'שגיאה, נסו שוב',
  SAVE_FAILED: 'שגיאה בשמירה — נסו שוב',
  END_DATE_BEFORE_START: 'תאריך סיום חייב להיות אחרי תאריך התחלה',
  END_TIME_BEFORE_START: 'שעת סיום חייבת להיות אחרי שעת התחלה',
} as const

export interface ScheduleBlock {
  _id: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  reason?: string
}

export type PublicScheduleBlock = Omit<ScheduleBlock, '_id' | 'reason'>
