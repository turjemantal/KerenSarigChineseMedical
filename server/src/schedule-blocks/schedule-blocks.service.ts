import { Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { ScheduleBlocksDao } from './schedule-blocks.dao';
import { Entity, notFoundMessage } from '../common/constants/errors.constants';
import { ScheduleBlockDocument } from './schedule-block.schema';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto';

@Injectable()
export class ScheduleBlocksService {
  constructor(private readonly dao: ScheduleBlocksDao) {}

  create(dto: CreateScheduleBlockDto & { endDate: string }): Promise<ScheduleBlockDocument> {
    return this.dao.create(dto);
  }

  findAll(): Promise<ScheduleBlockDocument[]> {
    return this.dao.findAll();
  }

  findInRange(from: string, to: string): Promise<ScheduleBlockDocument[]> {
    return this.dao.findInRange(from, to);
  }

  async delete(id: string): Promise<void> {
    if (!isValidObjectId(id)) throw new NotFoundException(notFoundMessage(Entity.ScheduleBlock, id));
    const block = await this.dao.delete(id);
    if (!block) throw new NotFoundException(notFoundMessage(Entity.ScheduleBlock, id));
  }
}
