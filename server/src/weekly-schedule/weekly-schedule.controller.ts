import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { WeeklyScheduleManager } from './weekly-schedule.manager';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { updateWeekdaySchema } from './dto/validations/weekly-schedule.schemas';

@Controller('weekly-schedule')
export class WeeklyScheduleController {
  constructor(private readonly manager: WeeklyScheduleManager) {}

  @UseGuards(AdminAuthGuard)
  @Get()
  getSchedule() {
    return this.manager.getSchedule();
  }

  @UseGuards(AdminAuthGuard)
  @Put(':weekday')
  updateDay(
    @Param('weekday', ParseIntPipe) weekday: number,
    @Body(new JoiValidationPipe(updateWeekdaySchema)) body: { times: string[] },
  ) {
    return this.manager.updateDay(weekday, body.times);
  }
}
