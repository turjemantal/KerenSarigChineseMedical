import { Injectable } from '@nestjs/common';
import { WeeklyScheduleService, WeekSchedule } from './weekly-schedule.service';

@Injectable()
export class WeeklyScheduleManager {
  constructor(private readonly service: WeeklyScheduleService) {}

  getSchedule(): Promise<WeekSchedule> {
    return this.service.getSchedule();
  }

  updateDay(weekday: number, times: string[]): Promise<WeekSchedule> {
    return this.service.setDay(weekday, times);
  }
}
