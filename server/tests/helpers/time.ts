// Test helper for the spacing/overlap boundary cases.
//
// Those tests are about the RULE ("a slot exactly one appointment away is still free"),
// not about a particular clock time. Hardcoding the boundary as a literal (`18:45`) meant
// every test had to be hand-edited when APPOINTMENT_DURATION_MINUTES changed — and a
// missed one would silently assert the old rule. Derive the boundary instead.
//
// Not matched by jest's `.*\.spec\.ts$` testRegex, so it is a helper, not a suite.

import { APPOINTMENT_DURATION_MINUTES } from '../../src/common/constants/schedule.constants';
import { timeToMinutes } from '../../src/common/utils/date.utils';

// 'HH:MM' + n minutes -> 'HH:MM'
export function addMinutes(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// The first time that is far enough away to be unaffected by `from` (exactly one
// appointment later — the inclusive edge of the rule).
export const oneAppointmentAfter = (from: string): string =>
  addMinutes(from, APPOINTMENT_DURATION_MINUTES);

// A time close enough to `from` to be rejected/hidden (one minute inside the window).
export const justInsideWindow = (from: string): string =>
  addMinutes(from, APPOINTMENT_DURATION_MINUTES - 1);
