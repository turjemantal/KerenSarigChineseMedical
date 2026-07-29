import { APPOINTMENT_DURATION_MINUTES } from '../constants'

// The public clinic settings the booking UI needs. The booking horizon lives in the DB;
// the appointment length is a server code constant that this client mirrors in
// constants.ts (the two can't share a module — separate Docker build contexts).
//
// A server-side test (server/tests/shared-constants.spec.ts) fails CI if the two copies
// diverge in the repo. That can't catch everything though: client and server ship as
// SEPARATE images, so a rollback of one alone puts a client in front of a server that
// disagrees with it. This check closes that gap at runtime — it can only ever fire on a
// genuine version skew, which is exactly when you want to know.

let driftReported = false

function assertDurationMatches(serverValue: unknown): void {
  if (typeof serverValue !== 'number' || serverValue === APPOINTMENT_DURATION_MINUTES) return
  if (driftReported) return
  driftReported = true
  console.error(
    `[config] appointment duration mismatch — server says ${serverValue} min, this client was built with ` +
    `${APPOINTMENT_DURATION_MINUTES} min. The client and server images are out of sync; the UI may show a ` +
    `length the booking rules do not enforce.`,
  )
}

// Fail-closed on any error (0 = booking effectively closed) rather than baking in a
// number — the server is the source of truth and never returns out-of-horizon availability.
export async function fetchBookingHorizon(): Promise<number> {
  try {
    const res = await fetch('/api/clinic-settings/public')
    if (res.ok) {
      const body = await res.json()
      assertDurationMatches(body?.appointmentDurationMinutes)
      if (typeof body?.bookingAheadDays === 'number') return body.bookingAheadDays
    }
  } catch { /* fall through to fail-closed */ }
  return 0
}
