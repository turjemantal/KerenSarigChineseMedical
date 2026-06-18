import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsManager } from './appointments.manager';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { createAppointmentSchema, createAdminAppointmentSchema, updateAppointmentSchema, rescheduleAppointmentSchema } from './dto/validations/appointment.schemas';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AuthUser } from '../auth/jwt.strategy';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly manager: AppointmentsManager) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new JoiValidationPipe(createAppointmentSchema)) dto: CreateAppointmentDto,
  ) {
    return this.manager.book(dto, { phone: user.phone, name: user.name });
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin')
  createForClient(
    @Body(new JoiValidationPipe(createAdminAppointmentSchema)) dto: CreateAppointmentDto,
  ) {
    return this.manager.bookForClient(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.manager.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.manager.getByPhone(user.phone);
  }

  // public — free bookable slots per date across a range (booking calendar)
  @Get('availability')
  getAvailabilityRange(@Query('from') from: string, @Query('to') to: string) {
    return this.manager.getAvailabilityRange(from, to);
  }

  // must come before :id
  @Get('availability/:date')
  getAvailability(@Param('date') date: string) {
    return this.manager.getAvailability(date);
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.manager.getById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateAppointmentSchema)) dto: UpdateAppointmentDto,
  ) {
    return this.manager.update(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.manager.approve(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id/noshow')
  markNoShow(@Param('id') id: string) {
    return this.manager.markNoShow(id);
  }

  // admin: manually (re)send the SMS/WhatsApp reminder for an appointment
  @UseGuards(AdminAuthGuard)
  @Post(':id/remind')
  sendReminder(@Param('id') id: string) {
    return this.manager.sendReminder(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelOwn(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.manager.cancelOwn(id, user.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reschedule')
  rescheduleOwn(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new JoiValidationPipe(rescheduleAppointmentSchema)) dto: RescheduleAppointmentDto,
  ) {
    return this.manager.rescheduleOwn(id, user.phone, dto.date, dto.time);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manager.remove(id);
  }
}
