import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  treatment?: string;

  @IsOptional() @IsString()
  concern?: string;

  @IsNotEmpty() @IsString()
  date: string;

  @IsNotEmpty() @IsString()
  time: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  source?: string;
}
