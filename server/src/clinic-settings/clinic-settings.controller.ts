import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ClinicSettingsManager } from './clinic-settings.manager';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { updateClinicSettingsSchema } from './dto/validations/clinic-settings.schemas';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@Controller('clinic-settings')
export class ClinicSettingsController {
  constructor(private readonly manager: ClinicSettingsManager) {}

  // public — only the booking horizon, so the booking calendar knows how far ahead to render
  @Get('public')
  getPublic() {
    return this.manager.getPublicSettings();
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  getSettings() {
    return this.manager.getSettings();
  }

  @UseGuards(AdminAuthGuard)
  @Patch()
  update(@Body(new JoiValidationPipe(updateClinicSettingsSchema)) body: UpdateClinicSettingsDto) {
    return this.manager.update(body);
  }
}
