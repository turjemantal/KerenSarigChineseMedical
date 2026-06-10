import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleBlock, ScheduleBlockDocument } from './schedule-block.schema';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto';

@Injectable()
export class ScheduleBlocksDao {
  constructor(@InjectModel(ScheduleBlock.name) private model: Model<ScheduleBlockDocument>) {}

  create(dto: CreateScheduleBlockDto & { endDate: string }): Promise<ScheduleBlockDocument> {
    return this.model.create(dto);
  }

  findAll(): Promise<ScheduleBlockDocument[]> {
    return this.model.find().sort({ startDate: 1, startTime: 1 }).exec();
  }

  findInRange(from: string, to: string): Promise<ScheduleBlockDocument[]> {
    return this.model
      .find({ startDate: { $lte: to }, endDate: { $gte: from } })
      .sort({ startDate: 1, startTime: 1 })
      .exec();
  }

  delete(id: string): Promise<ScheduleBlockDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
