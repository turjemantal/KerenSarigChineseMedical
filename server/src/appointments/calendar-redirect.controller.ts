import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppointmentsManager } from './appointments.manager';

@Controller('cal')
export class CalendarRedirectController {
  constructor(private readonly manager: AppointmentsManager) {}

  @Get(':id')
  async redirect(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const url = await this.manager.getCalendarUrl(id);
    if (!url) {
      res.status(404).end();
      return;
    }
    res.redirect(302, url);
  }
}
