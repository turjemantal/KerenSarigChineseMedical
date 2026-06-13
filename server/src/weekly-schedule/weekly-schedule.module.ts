import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeeklyScheduleDay, WeeklyScheduleDaySchema } from './weekly-schedule.schema';
import { WeeklyScheduleController } from './weekly-schedule.controller';
import { WeeklyScheduleManager } from './weekly-schedule.manager';
import { WeeklyScheduleService } from './weekly-schedule.service';
import { WeeklyScheduleDao } from './weekly-schedule.dao';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeeklyScheduleDay.name, schema: WeeklyScheduleDaySchema }]),
  ],
  controllers: [WeeklyScheduleController],
  providers: [WeeklyScheduleManager, WeeklyScheduleService, WeeklyScheduleDao],
  exports: [WeeklyScheduleManager],
})
export class WeeklyScheduleModule {}
