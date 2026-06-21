import { Injectable } from '@nestjs/common';
import { ClinicSettingsDao } from './clinic-settings.dao';

export interface ClinicSettingsView {
  bookingAheadDays: number;
  reminderHour: number;
}

@Injectable()
export class ClinicSettingsService {
  constructor(private readonly dao: ClinicSettingsDao) {}

  // the settings, read straight from the DB — or null when no document exists yet.
  // The document is provisioned outside the app (initDB locally, migration in prod);
  // the app never seeds it, so there is no hardcoded runtime fallback. Callers
  // fail-closed on null (no availability / reminders skipped).
  async getSettings(): Promise<ClinicSettingsView | null> {
    const doc = await this.dao.get();
    if (!doc) return null;
    return { bookingAheadDays: doc.bookingAheadDays, reminderHour: doc.reminderHour };
  }

  // admin save: merge the patch over the current settings and persist. The values are
  // admin-provided (not hardcoded). If no document exists yet, a partial patch missing
  // a required field fails validation loudly — the migration guarantees the document.
  async update(patch: Partial<ClinicSettingsView>): Promise<ClinicSettingsView> {
    const current = await this.getSettings();
    const next = await this.dao.upsert({ ...current, ...patch } as ClinicSettingsView);
    return { bookingAheadDays: next!.bookingAheadDays, reminderHour: next!.reminderHour };
  }
}
