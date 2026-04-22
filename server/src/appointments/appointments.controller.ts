import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsManager } from './appointments.manager';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { createAppointmentSchema, updateAppointmentSchema } from './dto/validations/appointment.schemas';
import { AuthUser } from '../auth/jwt.strategy';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly manager: AppointmentsManager) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new JoiValidationPipe(createAppointmentSchema)) dto: CreateAppointmentDto,
  ) {
    return this.manager.book({ ...dto, phone: user.phone, name: dto.name || user.name || user.phone });
  }

  @Get()
  findAll() {
    return this.manager.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.manager.getByPhone(user.phone);
  }

  // must come before :id
  @Get('availability/:date')
  getAvailability(@Param('date') date: string) {
    return this.manager.getAvailability(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.manager.getById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateAppointmentSchema)) dto: UpdateAppointmentDto,
  ) {
    return this.manager.update(id, dto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.manager.update(id, { status: AppointmentStatus.SCHEDULED });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelOwn(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const appt = await this.manager.getById(id);
    if (appt.phone !== user.phone) throw new ForbiddenException();
    return this.manager.update(id, { status: AppointmentStatus.CANCELLED });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manager.remove(id);
  }
}
