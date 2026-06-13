export interface BlockLike {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

// Is a specific time blocked on a date? Full-day blocks (no times) close the
// whole day; timed blocks close [startTime, endTime).
function isBlocked(date: string, time: string, blocks: BlockLike[]): boolean {
  return blocks.some(b => {
    if (date < b.startDate || date > b.endDate) return false;
    if (!b.startTime || !b.endTime) return true;
    return time >= b.startTime && time < b.endTime;
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
//   base weekly schedule ∪ extra slots − taken − blocked − past − beyond horizon
export function computeAvailableSlots(input: AvailabilityInput): string[] {
  const { date, baseTimes, extraTimes, takenTimes, blocks, today, nowTime, maxDate } = input;
  if (date < today || date > maxDate) return [];

  const candidate = Array.from(new Set([...baseTimes, ...extraTimes])).sort();
  const taken = new Set(takenTimes);

  return candidate.filter(time => {
    if (taken.has(time)) return false;
    if (isBlocked(date, time, blocks)) return false;
    if (date === today && time <= nowTime) return false;
    return true;
  });
}
