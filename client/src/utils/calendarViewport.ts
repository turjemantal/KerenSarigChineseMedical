// The admin calendar used to render a FIXED viewport — Mon–Fri columns and an 08:00–20:00
// hour grid — while the weekly board lets Keren open any of the 7 weekdays at any time
// between 07:00 and 21:00. Anything she opened outside that fixed window was booked
// normally by clients but drawn off-grid, so it looked like the appointment never arrived.
//
// These helpers derive the viewport from the actual schedule data instead, so the grid can
// only ever grow to fit what exists — never clip it.

import { APPOINTMENT_DURATION_MINUTES } from '../constants'

// Where the grid starts before any data widens it. The clinic's usual working window.
export const CALENDAR_DEFAULT_START_HOUR = 8
export const CALENDAR_DEFAULT_END_HOUR = 20

// The week always starts on Sunday (Israeli week) and always renders at least Sun–Thu,
// so an empty week still looks like a week rather than a blank strip.
export const DAYS_IN_WEEK = 7
export const CALENDAR_MIN_DAY_COUNT = 5

const MINUTES_PER_HOUR = 60

function parseTime(time: string): { hour: number; minute: number } | null {
  const [hour, minute] = time.split(':').map(Number)
  return Number.isFinite(hour) && Number.isFinite(minute) ? { hour, minute } : null
}

// How many day columns the week grid renders, given whether each of the 7 days carries
// anything (weekly-schedule hours, an appointment, or an extra slot). Always a contiguous
// run from Sunday — Sun–Thu at minimum, extended through Friday/Saturday when either of
// them carries something. A day is therefore never dropped while it still holds a booking.
export function visibleDayCount(hasContent: boolean[]): number {
  let last = CALENDAR_MIN_DAY_COUNT - 1
  for (let i = hasContent.length - 1; i > last; i--) {
    if (hasContent[i]) {
      last = i
      break
    }
  }
  return last + 1
}

// The [startHour, endHour) span the grid must cover.
//   slotTimes  — bookable/booked start times; each occupies APPOINTMENT_DURATION_MINUTES,
//                so the grid has to reach past the END of that window.
//   plainTimes — instants that merely have to be on-screen (block start/end edges).
// The default window is only ever widened, and the result stays inside a real day.
export function calendarHourRange(
  slotTimes: string[],
  plainTimes: string[] = [],
): { startHour: number; endHour: number } {
  let startHour = CALENDAR_DEFAULT_START_HOUR
  let endHour = CALENDAR_DEFAULT_END_HOUR

  const widen = (time: string, trailingMinutes: number) => {
    const parsed = parseTime(time)
    if (!parsed) return
    startHour = Math.min(startHour, parsed.hour)
    endHour = Math.max(
      endHour,
      Math.ceil((parsed.hour * MINUTES_PER_HOUR + parsed.minute + trailingMinutes) / MINUTES_PER_HOUR),
    )
  }

  for (const time of slotTimes) widen(time, APPOINTMENT_DURATION_MINUTES)
  for (const time of plainTimes) widen(time, 0)

  return { startHour: Math.max(0, startHour), endHour: Math.min(24, endHour) }
}
