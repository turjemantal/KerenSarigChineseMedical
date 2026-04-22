export class CreateLeadDto {
  name: string;
  phone: string;
  email?: string;
  concern: string;
  treatment?: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  source?: string;
}
