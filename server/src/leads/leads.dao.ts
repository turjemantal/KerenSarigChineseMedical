import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsDao {
  constructor(@InjectModel(Lead.name) private model: Model<LeadDocument>) {}

  create(dto: CreateLeadDto): Promise<LeadDocument> {
    return this.model.create(dto);
  }

  findAll(): Promise<LeadDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  findById(id: string): Promise<LeadDocument | null> {
    return this.model.findById(id).exec();
  }

  update(id: string, dto: UpdateLeadDto): Promise<LeadDocument | null> {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string): Promise<LeadDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
