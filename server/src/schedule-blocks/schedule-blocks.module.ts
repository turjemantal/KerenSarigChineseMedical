import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleBlock, ScheduleBlockSchema } from './schedule-block.schema';
import { ExtraSlot, ExtraSlotSchema } from './extra-slot.schema';
import { ScheduleBlocksController } from './schedule-blocks.controller';
import { ScheduleBlocksManager } from './schedule-blocks.manager';
import { ScheduleBlocksService } from './schedule-blocks.service';
import { ScheduleBlocksDao } from './schedule-blocks.dao';
import { ExtraSlotsService } from './extra-slots.service';
import { ExtraSlotsDao } from './extra-slots.dao';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleBlock.name, schema: ScheduleBlockSchema },
      { name: ExtraSlot.name, schema: ExtraSlotSchema },
    ]),
  ],
  controllers: [ScheduleBlocksController],
  providers: [ScheduleBlocksManager, ScheduleBlocksService, ScheduleBlocksDao, ExtraSlotsService, ExtraSlotsDao],
  exports: [ScheduleBlocksManager],
})
export class ScheduleBlocksModule {}
