import { BadRequestException, Injectable } from '@nestjs/common';
import { ScheduleBlocksService } from './schedule-blocks.service';
import { ScheduleBlockDocument } from './schedule-block.schema';
import { ExtraSlotsService } from './extra-slots.service';
import { ExtraSlotDocument } from './extra-slot.schema';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto';
import { MAX_PUBLIC_RANGE_DAYS, DATE_REGEX } from '../common/constants/validation.constants';
import { ERRORS } from '../common/constants/errors.constants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
  addExtraSlot(date: string, time: string): Promise<ExtraSlotDocument> {
    return this.extraSlots.create(date, time);
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
