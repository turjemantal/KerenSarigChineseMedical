import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { ExtraSlotsDao } from './extra-slots.dao';
import { ExtraSlotDocument } from './extra-slot.schema';
import { ERRORS, Entity, notFoundMessage } from '../common/constants/errors.constants';

@Injectable()
export class ExtraSlotsService {
  constructor(private readonly dao: ExtraSlotsDao) {}

  async create(date: string, time: string): Promise<ExtraSlotDocument> {
    try {
      return await this.dao.create(date, time);
    } catch (e: unknown) {
      // unique index violation → the slot is already open
      if ((e as { code?: number }).code === 11000) {
        throw new ConflictException(ERRORS.EXTRA_SLOT_EXISTS);
      }
      throw e;
    }
  }

  findAll(): Promise<ExtraSlotDocument[]> {
    return this.dao.findAll();
  }

  findByDate(date: string): Promise<ExtraSlotDocument[]> {
    return this.dao.findByDate(date);
  }

  findInRange(from: string, to: string): Promise<ExtraSlotDocument[]> {
    return this.dao.findInRange(from, to);
  }

  async delete(id: string): Promise<void> {
    if (!isValidObjectId(id)) throw new NotFoundException(notFoundMessage(Entity.ExtraSlot, id));
    const removed = await this.dao.delete(id);
    if (!removed) throw new NotFoundException(notFoundMessage(Entity.ExtraSlot, id));
  }
}
