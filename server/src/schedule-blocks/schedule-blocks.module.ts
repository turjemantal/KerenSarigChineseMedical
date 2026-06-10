import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleBlock, ScheduleBlockSchema } from './schedule-block.schema';
import { ScheduleBlocksController } from './schedule-blocks.controller';
import { ScheduleBlocksManager } from './schedule-blocks.manager';
import { ScheduleBlocksService } from './schedule-blocks.service';
import { ScheduleBlocksDao } from './schedule-blocks.dao';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ScheduleBlock.name, schema: ScheduleBlockSchema }]),
  ],
  controllers: [ScheduleBlocksController],
  providers: [ScheduleBlocksManager, ScheduleBlocksService, ScheduleBlocksDao],
  exports: [ScheduleBlocksManager],
})
export class ScheduleBlocksModule {}
