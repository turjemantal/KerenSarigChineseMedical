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
