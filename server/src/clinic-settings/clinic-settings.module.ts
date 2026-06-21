import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicSettings, ClinicSettingsSchema } from './clinic-settings.schema';
import { ClinicSettingsController } from './clinic-settings.controller';
import { ClinicSettingsManager } from './clinic-settings.manager';
import { ClinicSettingsService } from './clinic-settings.service';
import { ClinicSettingsDao } from './clinic-settings.dao';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClinicSettings.name, schema: ClinicSettingsSchema }]),
  ],
  controllers: [ClinicSettingsController],
  providers: [ClinicSettingsManager, ClinicSettingsService, ClinicSettingsDao],
  exports: [ClinicSettingsManager],
})
export class ClinicSettingsModule {}
