import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class UpdateAppointmentDto {
  status?: AppointmentStatus;
  notes?: string;
}
