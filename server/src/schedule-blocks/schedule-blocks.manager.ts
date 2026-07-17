import { BadRequestException, Injectable } from '@nestjs/common';
import { ScheduleBlocksService } from './schedule-blocks.service';
import { ScheduleBlockDocument } from './schedule-block.schema';
import { ExtraSlotsService } from './extra-slots.service';
import { ExtraSlotDocument } from './extra-slot.schema';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto';
import { MAX_PUBLIC_RANGE_DAYS, DATE_REGEX } from '../common/constants/validation.constants';
import { ERRORS } from '../common/constants/errors.constants';
import { MS_PER_DAY } from '../common/constants/time.constants';
import { APPOINTMENT_DURATION_MINUTES } from '../common/constants/schedule.constants';
import { timeToMinutes, weekdayOf } from '../common/utils/date.utils';
import { WeeklyScheduleManager } from '../weekly-schedule/weekly-schedule.manager';

export interface PublicScheduleBlock {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

@Injectable()
export class ScheduleBlocksManager {
  constructor(
    private readonly service: ScheduleBlocksService,
    private readonly extraSlots: ExtraSlotsService,
    private readonly weeklySchedule: WeeklyScheduleManager,
  ) {}

  async create(dto: CreateScheduleBlockDto): Promise<ScheduleBlockDocument> {
    const endDate = dto.endDate || dto.startDate;
    if (endDate < dto.startDate) {
      throw new BadRequestException(ERRORS.END_DATE_BEFORE_START);
    }
    if (dto.startTime && dto.endTime && dto.endTime <= dto.startTime) {
      throw new BadRequestException(ERRORS.END_TIME_BEFORE_START);
    }
    return this.service.create({ ...dto, endDate });
  }

  getAll(): Promise<ScheduleBlockDocument[]> {
    return this.service.findAll();
  }

  // public view for the booking calendar — without internal reasons
  async getPublicInRange(from: string, to: string): Promise<PublicScheduleBlock[]> {
    if (!DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
      throw new BadRequestException(ERRORS.INVALID_DATE_FORMAT);
    }
    if (to < from) {
      throw new BadRequestException(ERRORS.INVALID_DATE_RANGE);
    }
    const rangeDays = (Date.parse(to) - Date.parse(from)) / MS_PER_DAY;
    if (rangeDays > MAX_PUBLIC_RANGE_DAYS) {
      throw new BadRequestException(ERRORS.dateRangeTooLarge(MAX_PUBLIC_RANGE_DAYS));
    }
    const blocks = await this.service.findInRange(from, to);
    return blocks.map(b => ({
      startDate: b.startDate,
      endDate: b.endDate,
      startTime: b.startTime,
      endTime: b.endTime,
    }));
  }

  getBlocksForDate(date: string): Promise<ScheduleBlockDocument[]> {
    return this.service.findInRange(date, date);
  }

  getBlocksInRange(from: string, to: string): Promise<ScheduleBlockDocument[]> {
    return this.service.findInRange(from, to);
  }

  remove(id: string): Promise<void> {
    return this.service.delete(id);
  }

  // ─── Extra slots (admin opens additional bookable times on a date) ──────────
  async addExtraSlot(date: string, time: string): Promise<ExtraSlotDocument> {
    await this.assertNoOverlap(date, time);
    return this.extraSlots.create(date, time);
  }

  // An extra slot must be at least APPOINTMENT_DURATION_MINUTES from every base
  // weekly-schedule time on that date's weekday and from every other extra slot
  // already open on that date. (Not checked against existing appointments here —
  // that would require injecting AppointmentsManager, creating a circular module
  // dependency; the actual booking is still protected by computeAvailableSlots.)
  private async assertNoOverlap(date: string, time: string): Promise<void> {
    const minutes = timeToMinutes(time);
    const schedule = await this.weeklySchedule.getSchedule();
    const baseTimes = schedule[weekdayOf(date)] ?? [];
    const existingExtras = await this.extraSlots.findByDate(date);
    const otherTimes = [...baseTimes, ...existingExtras.map(s => s.time)];
    const overlaps = otherTimes.some(t => Math.abs(timeToMinutes(t) - minutes) < APPOINTMENT_DURATION_MINUTES);
    if (overlaps) {
      throw new BadRequestException(ERRORS.EXTRA_SLOT_OVERLAPS);
    }
  }

  getExtraSlots(): Promise<ExtraSlotDocument[]> {
    return this.extraSlots.findAll();
  }

  getExtraSlotsInRange(from: string, to: string): Promise<ExtraSlotDocument[]> {
    return this.extraSlots.findInRange(from, to);
  }

  removeExtraSlot(id: string): Promise<void> {
    return this.extraSlots.delete(id);
  }
}
