import { Injectable, Logger } from '@nestjs/common';
import { ClinicSettingsService, ClinicSettingsView } from './clinic-settings.service';
import { APPOINTMENT_DURATION_MINUTES } from '../common/constants/schedule.constants';

@Injectable()
export class ClinicSettingsManager {
  private readonly logger = new Logger(ClinicSettingsManager.name);

  constructor(private readonly service: ClinicSettingsService) {}

  getSettings(): Promise<ClinicSettingsView | null> {
    return this.service.getSettings();
  }

  // Public surface for the client booking calendar: the booking horizon (from the DB) and
  // the appointment length (a code constant). No settings document → fail-closed
  // (0 = booking effectively closed).
  //
  // appointmentDurationMinutes is published so the client can verify its own copy of the
  // constant still matches the server's. Client and server ship as SEPARATE images, so one
  // can be rolled back independently of the other — a build-time check can't catch that
  // skew, only a runtime comparison can. See client/src/utils/publicSettings.ts.
  async getPublicSettings(): Promise<{ bookingAheadDays: number; appointmentDurationMinutes: number }> {
    const settings = await this.service.getSettings();
    return {
      bookingAheadDays: settings?.bookingAheadDays ?? 0,
      appointmentDurationMinutes: APPOINTMENT_DURATION_MINUTES,
    };
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
