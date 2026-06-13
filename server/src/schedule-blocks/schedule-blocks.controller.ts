import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ScheduleBlocksManager } from './schedule-blocks.manager';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto';
import { CreateExtraSlotDto } from './dto/create-extra-slot.dto';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { createScheduleBlockSchema } from './dto/validations/schedule-block.schemas';
import { createExtraSlotSchema } from './dto/validations/extra-slot.schemas';

@Controller('schedule-blocks')
export class ScheduleBlocksController {
  constructor(private readonly manager: ScheduleBlocksManager) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body(new JoiValidationPipe(createScheduleBlockSchema)) dto: CreateScheduleBlockDto) {
    return this.manager.create(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.manager.getAll();
  }

  // public — lets the booking calendar grey out closed days and blocked hours
  @Get('public')
  findPublic(@Query('from') from: string, @Query('to') to: string) {
    return this.manager.getPublicInRange(from, to);
  }

  // ─── Extra slots (admin opens additional bookable times) ────────────────────
  @UseGuards(AdminAuthGuard)
  @Post('extra-slots')
  addExtraSlot(@Body(new JoiValidationPipe(createExtraSlotSchema)) dto: CreateExtraSlotDto) {
    return this.manager.addExtraSlot(dto.date, dto.time);
  }

  @UseGuards(AdminAuthGuard)
  @Get('extra-slots')
  findExtraSlots() {
    return this.manager.getExtraSlots();
  }

  @UseGuards(AdminAuthGuard)
  @Delete('extra-slots/:id')
  removeExtraSlot(@Param('id') id: string) {
    return this.manager.removeExtraSlot(id);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manager.remove(id);
  }
}
