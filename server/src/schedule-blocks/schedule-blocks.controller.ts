import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ScheduleBlocksManager } from './schedule-blocks.manager';
import { CreateScheduleBlockDto } from './dto/create-schedule-block.dto';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { createScheduleBlockSchema } from './dto/validations/schedule-block.schemas';
import { DATE_REGEX } from '../common/constants/validation.constants';
import { ERRORS } from '../common/constants/errors.constants';

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
    if (!DATE_REGEX.test(from || '') || !DATE_REGEX.test(to || '')) {
      throw new BadRequestException(ERRORS.INVALID_DATE_FORMAT);
    }
    return this.manager.getPublicInRange(from, to);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manager.remove(id);
  }
}
