import { BadRequestException, Injectable } from '@nestjs/common';
import { WeeklyScheduleService, WeekSchedule } from './weekly-schedule.service';
import { ERRORS } from '../common/constants/errors.constants';
import { APPOINTMENT_DURATION_MINUTES } from '../common/constants/schedule.constants';
import { timeToMinutes } from '../common/utils/date.utils';

@Injectable()
export class WeeklyScheduleManager {
  constructor(private readonly service: WeeklyScheduleService) {}

  getSchedule(): Promise<WeekSchedule> {
    return this.service.getSchedule();
  }

  async updateDay(weekday: number, times: string[]): Promise<WeekSchedule> {
    this.assertSpaced(times);
    return this.service.setDay(weekday, times);
  }

  // A day's times must be at least APPOINTMENT_DURATION_MINUTES apart, so that no two
  // appointments booked on the base schedule can ever overlap.
  private assertSpaced(times: string[]): void {
    const sorted = [...times].sort();
    for (let i = 1; i < sorted.length; i++) {
      const gap = timeToMinutes(sorted[i]) - timeToMinutes(sorted[i - 1]);
      if (gap < APPOINTMENT_DURATION_MINUTES) {
        throw new BadRequestException(ERRORS.SCHEDULE_TIMES_TOO_CLOSE);
      }
    }
  }
}
