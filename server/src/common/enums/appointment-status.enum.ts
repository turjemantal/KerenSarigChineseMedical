export enum AppointmentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  NOSHOW = 'noshow',
}

// Terminal (final) statuses — the appointment lifecycle is over. No further status
// transition is allowed out of these (no cancel / no-show / approve, etc.).
export const TERMINAL_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.REJECTED,
  AppointmentStatus.NOSHOW,
];

export const isTerminalAppointmentStatus = (status: AppointmentStatus): boolean =>
  TERMINAL_APPOINTMENT_STATUSES.includes(status);

// Active (slot-occupying) statuses — an appointment in one of these reserves its
// date+time slot, so no other appointment may take that slot. Everything else
// (cancelled / rejected / completed / no-show) frees the slot. This set drives both
// the availability calculation and the DB-level unique-slot guard (no double-booking).
export const ACTIVE_APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.SCHEDULED,
];

// Allowed status transitions (server-authoritative state machine), enforced in
// AppointmentsManager.update. A PENDING request is resolved by approving it (→SCHEDULED)
// or rejecting it (→REJECTED, via the reject endpoint); the patient may also withdraw
// their own pending request (→CANCELLED). A SCHEDULED appointment can be cancelled, marked
// no-show, or completed. Terminal statuses allow nothing. NOTE: cancelling/no-show of a
// PENDING request is intentionally NOT an admin action — Keren confirms or rejects it
// (the dashboard only offers cancel/no-show once an appointment is scheduled).
export const ALLOWED_STATUS_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [AppointmentStatus.SCHEDULED, AppointmentStatus.REJECTED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.SCHEDULED]: [AppointmentStatus.CANCELLED, AppointmentStatus.NOSHOW, AppointmentStatus.COMPLETED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.REJECTED]: [],
  [AppointmentStatus.NOSHOW]: [],
};

// true if `to` is a legal next status from `from` (same status is a no-op → allowed).
export const canTransitionStatus = (from: AppointmentStatus, to: AppointmentStatus): boolean =>
  from === to || ALLOWED_STATUS_TRANSITIONS[from].includes(to);
