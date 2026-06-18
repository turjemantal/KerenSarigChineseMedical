// Single source for millisecond durations on the server — avoids magic numbers
// like 3_600_000 / 86_400_000 scattered across modules.
export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
