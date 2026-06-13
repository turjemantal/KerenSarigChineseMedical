import { BadRequestException, Injectable } from '@nestjs/common';
import { WeeklyScheduleDao } from './weekly-schedule.dao';
import { WEEKLY_SCHEDULE } from '../common/constants/schedule.constants';
import { TIME_REGEX } from '../common/constants/validation.constants';
import { ERRORS } from '../common/constants/errors.constants';
import { Weekday } from '../common/enums/weekday.enum';

export type WeekSchedule = Record<Weekday, string[]>;

@Injectable()
export class WeeklyScheduleService {
  constructor(private readonly dao: WeeklyScheduleDao) {}

  // the effective weekly schedule: defaults, overridden by any customised days
  async getSchedule(): Promise<WeekSchedule> {
    const schedule = { ...WEEKLY_SCHEDULE } as WeekSchedule;
    for (const day of await this.dao.findAll()) {
      schedule[day.weekday as Weekday] = day.times;
    }
    return schedule;
  }

  async setDay(weekday: number, times: string[]): Promise<WeekSchedule> {
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
      throw new BadRequestException(ERRORS.INVALID_WEEKDAY);
    }
    if (!times.every(t => TIME_REGEX.test(t))) {
      throw new BadRequestException(ERRORS.INVALID_TIME_FORMAT);
    }
    // normalise: unique + ascending
    const normalised = Array.from(new Set(times)).sort();
    await this.dao.upsert(weekday, normalised);
    return this.getSchedule();
  }
}
