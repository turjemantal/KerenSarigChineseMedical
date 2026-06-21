import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicSettings, ClinicSettingsDocument } from './clinic-settings.schema';

@Injectable()
export class ClinicSettingsDao {
  constructor(@InjectModel(ClinicSettings.name) private model: Model<ClinicSettingsDocument>) {}

  // the single settings document, or null when none has been saved yet
  get(): Promise<ClinicSettingsDocument | null> {
    return this.model.findOne().exec();
  }

  // upsert the singleton: an empty filter matches the one document (or creates it)
  upsert(settings: { bookingAheadDays: number; reminderHour: number }): Promise<ClinicSettingsDocument | null> {
    return this.model.findOneAndUpdate({}, settings, { upsert: true, new: true }).exec();
  }
}
