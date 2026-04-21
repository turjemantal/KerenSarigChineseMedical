import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './lead.schema';
import { LeadsController } from './leads.controller';
import { LeadsManager } from './leads.manager';
import { LeadsService } from './leads.service';
import { LeadsDao } from './leads.dao';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
  ],
  controllers: [LeadsController],
  providers: [LeadsManager, LeadsService, LeadsDao],
})
export class LeadsModule {}
