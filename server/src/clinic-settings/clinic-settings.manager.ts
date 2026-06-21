import { Injectable, Logger } from '@nestjs/common';
import { ClinicSettingsService, ClinicSettingsView } from './clinic-settings.service';

@Injectable()
export class ClinicSettingsManager {
  private readonly logger = new Logger(ClinicSettingsManager.name);

  constructor(private readonly service: ClinicSettingsService) {}

  getSettings(): Promise<ClinicSettingsView | null> {
    return this.service.getSettings();
  }

  // only the booking horizon is public — exposed to the client booking calendar.
  // No settings document → fail-closed (0 = booking effectively closed).
  async getPublicSettings(): Promise<{ bookingAheadDays: number }> {
    const settings = await this.service.getSettings();
    return { bookingAheadDays: settings?.bookingAheadDays ?? 0 };
  }

  // log the before→after so the change is self-explanatory in the structured logs
  async update(patch: Partial<ClinicSettingsView>): Promise<ClinicSettingsView> {
    const before = await this.service.getSettings();
    const after = await this.service.update(patch);
    const fmt = (s: ClinicSettingsView | null) => (s ? `${s.bookingAheadDays}d/@${s.reminderHour}` : 'unset');
    this.logger.log(`[ClinicSettings] updated ${fmt(before)} → ${after.bookingAheadDays}d/@${after.reminderHour}`);
    return after;
  }
}
