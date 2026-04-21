import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty() @IsString()
  name: string;

  @IsNotEmpty() @IsString()
  phone: string;

  @IsOptional() @IsString()
  email?: string;

  @IsNotEmpty() @IsString()
  concern: string;

  @IsOptional() @IsString()
  treatment?: string;

  @IsOptional() @IsString()
  preferredDate?: string;

  @IsOptional() @IsString()
  preferredTime?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsString()
  source?: string;
}
