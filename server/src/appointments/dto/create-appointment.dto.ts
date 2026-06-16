import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class CreateAppointmentDto {
  name?: string;
  phone?: string;
  email?: string;
  treatment?: string;
  concern?: string;
  date: string;
  time: string;
  notes?: string;
  source?: string;
  status?: AppointmentStatus; // set server-side only (e.g. admin-created appointments)
}
