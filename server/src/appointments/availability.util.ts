import { APPOINTMENT_DURATION_MINUTES } from '../common/constants/schedule.constants';
import { timeToMinutes } from '../common/utils/date.utils';

export interface BlockLike {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

// Is a slot starting at `time` blocked on a date? An appointment occupies the whole
// [time, time + APPOINTMENT_DURATION_MINUTES) window, so a timed block closes every
// slot whose window OVERLAPS [startTime, endTime) — not just one whose start falls
// inside it (a 09:00 slot runs into a 09:30–11:00 block and must be closed). A slot
// that ends exactly when the block starts stays open. Full-day blocks (no times)
// close the whole day.
function isBlocked(date: string, time: string, blocks: BlockLike[]): boolean {
  const start = timeToMinutes(time);
  const end = start + APPOINTMENT_DURATION_MINUTES;
  return blocks.some(b => {
    if (date < b.startDate || date > b.endDate) return false;
    if (!b.startTime || !b.endTime) return true;
    return start < timeToMinutes(b.endTime) && end > timeToMinutes(b.startTime);
  });
}

export interface AvailabilityInput {
  date: string;
  baseTimes: string[]; // the weekly-schedule slots for this date's weekday
  extraTimes: string[]; // admin-opened extra slots for this date
  takenTimes: string[]; // booked (non-cancelled) times on this date
  blocks: BlockLike[]; // blocks covering this date
  today: string; // clinic today (YYYY-MM-DD)
  nowTime: string; // clinic current time (HH:MM)
  maxDate: string; // latest bookable date (YYYY-MM-DD), inclusive
}

// The single source of truth for which slots are bookable on a date:
//   base weekly schedule ∪ extra slots − taken (± APPOINTMENT_DURATION_MINUTES) − blocked − past − beyond horizon
// A candidate is unavailable if it falls within APPOINTMENT_DURATION_MINUTES of any
// taken time in either direction (an appointment occupies that whole window, not just
// its exact start time) — a candidate exactly APPOINTMENT_DURATION_MINUTES away stays
// available (strict "<", not "<=").
export function computeAvailableSlots(input: AvailabilityInput): string[] {
  const { date, baseTimes, extraTimes, takenTimes, blocks, today, nowTime, maxDate } = input;
  if (date < today || date > maxDate) return [];

  const candidate = Array.from(new Set([...baseTimes, ...extraTimes])).sort();
  const takenMinutes = takenTimes.map(timeToMinutes);

  return candidate.filter(time => {
    const minutes = timeToMinutes(time);
    if (takenMinutes.some(t => Math.abs(t - minutes) < APPOINTMENT_DURATION_MINUTES)) return false;
    if (isBlocked(date, time, blocks)) return false;
    if (date === today && time <= nowTime) return false;
    return true;
  });
}
