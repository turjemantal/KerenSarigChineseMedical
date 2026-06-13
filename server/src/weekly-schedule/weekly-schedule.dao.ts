import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeeklyScheduleDay, WeeklyScheduleDayDocument } from './weekly-schedule.schema';

@Injectable()
export class WeeklyScheduleDao {
  constructor(@InjectModel(WeeklyScheduleDay.name) private model: Model<WeeklyScheduleDayDocument>) {}

  findAll(): Promise<WeeklyScheduleDayDocument[]> {
    return this.model.find().exec();
  }

  upsert(weekday: number, times: string[]): Promise<WeeklyScheduleDayDocument | null> {
    return this.model.findOneAndUpdate({ weekday }, { times }, { upsert: true, new: true }).exec();
  }
}
