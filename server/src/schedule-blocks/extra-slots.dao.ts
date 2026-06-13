import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtraSlot, ExtraSlotDocument } from './extra-slot.schema';

@Injectable()
export class ExtraSlotsDao {
  constructor(@InjectModel(ExtraSlot.name) private model: Model<ExtraSlotDocument>) {}

  create(date: string, time: string): Promise<ExtraSlotDocument> {
    return this.model.create({ date, time });
  }

  findAll(): Promise<ExtraSlotDocument[]> {
    return this.model.find().sort({ date: 1, time: 1 }).exec();
  }

  findByDate(date: string): Promise<ExtraSlotDocument[]> {
    return this.model.find({ date }).sort({ time: 1 }).exec();
  }

  findInRange(from: string, to: string): Promise<ExtraSlotDocument[]> {
    return this.model.find({ date: { $gte: from, $lte: to } }).sort({ date: 1, time: 1 }).exec();
  }

  delete(id: string): Promise<ExtraSlotDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
