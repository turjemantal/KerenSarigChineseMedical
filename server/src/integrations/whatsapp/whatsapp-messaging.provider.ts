import { Injectable } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { IMessagingProvider } from '../messaging/messaging-provider.interface';
import { otpParams, bookingParams, bookingRequestParams, reminderParams, newBookingAlertParams } from '../../common/constants/messages.constants';
import { config } from '../../config';

@Injectable()
export class WhatsappMessagingProvider implements IMessagingProvider {
  constructor(private readonly whatsapp: WhatsappService) {}

  sendOtp(phone: string, code: string): Promise<void> {
    return this.whatsapp.sendTemplate(phone, config.whatsapp.templates.otp, otpParams(code));
  }

  sendBookingRequestReceived(phone: string, name: string, date: string, time: string): Promise<void> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.bookingRequest,
      bookingRequestParams(name, date, time),
    );
  }

  sendBookingConfirmation(phone: string, name: string, date: string, time: string): Promise<void> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.bookingConfirmation,
      bookingParams(name, date, time),
    );
  }

  sendAppointmentReminder(phone: string, time: string): Promise<void> {
    return this.whatsapp.sendTemplate(phone, config.whatsapp.templates.appointmentReminder, reminderParams(time));
  }

  sendNewBookingAlert(phone: string, name: string, date: string, time: string): Promise<void> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.newBookingAlert,
      newBookingAlertParams(name, date, time),
    );
  }
}
