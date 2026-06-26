import { CLINIC_CONTACT, APPOINTMENT_DURATION_MINUTES } from '../constants'

const CLINIC_TIMEZONE = 'Asia/Jerusalem'
const CLINIC_NAME = 'קליניקת קרן שריג'

function formatDateTime(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM → YYYYMMDDTHHmmss (local, paired with ctz)
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
}

function addMinutesToDateTime(date: string, time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h * 60 + m + minutes
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  const endTime = `${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`
  return `${date.replace(/-/g, '')}T${endTime}`
}

export function buildGoogleCalendarUrl(date: string, time: string): string {
  const start = formatDateTime(date, time)
  const end = addMinutesToDateTime(date, time, APPOINTMENT_DURATION_MINUTES)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `תור - ${CLINIC_NAME}`,
    dates: `${start}/${end}`,
    ctz: CLINIC_TIMEZONE,
    location: CLINIC_CONTACT.address,
    details: `טיפול בקליניקת ${CLINIC_NAME}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
