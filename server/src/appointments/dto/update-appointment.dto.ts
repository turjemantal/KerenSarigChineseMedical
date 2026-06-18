import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class UpdateAppointmentDto {
  status?: AppointmentStatus;
  notes?: string;
  // set server-side only (e.g. a client reschedule moves the slot)
  date?: string;
  time?: string;
}
