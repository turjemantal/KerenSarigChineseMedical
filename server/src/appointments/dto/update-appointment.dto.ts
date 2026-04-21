import { IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  notes?: string;
}
