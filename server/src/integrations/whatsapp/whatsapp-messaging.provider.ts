import { Injectable } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { IMessagingProvider } from '../messaging/messaging-provider.interface';
import { otpParams, bookingParams, bookingRequestParams, bookingRejectedParams, bookingCancelledParams, reminderParams, newBookingAlertParams, cancellationAlertParams, leadAlertParams } from '../../common/constants/messages.constants';
import { config } from '../../config';

@Injectable()
export class WhatsappMessagingProvider implements IMessagingProvider {
  constructor(private readonly whatsapp: WhatsappService) {}

  sendOtp(phone: string, code: string): Promise<boolean> {
    return this.whatsapp.sendTemplate(phone, config.whatsapp.templates.otp, otpParams(code));
  }

  sendBookingRequestReceived(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.bookingRequest,
      bookingRequestParams(name, date, time),
    );
  }

  sendBookingConfirmation(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.bookingConfirmation,
      bookingParams(name, date, time),
    );
  }

  // A rejection has no sensible fallback template, so if a dedicated one isn't approved
  // and configured yet, skip the send (the reject itself still succeeds) instead of
  // firing a doomed API call. SMS installs send the text unconditionally.
  sendBookingRejected(phone: string, name: string, date: string, time: string): Promise<boolean> {
    const template = config.whatsapp.templates.bookingRejected;
    if (!template) return Promise.resolve(false);
    return this.whatsapp.sendTemplate(phone, template, bookingRejectedParams(name, date, time));
  }

  // Same reasoning as a rejection: there is no sensible fallback template for telling
  // someone their appointment is off, so skip the send until a dedicated template is
  // approved and configured rather than firing a doomed API call. SMS installs always send.
  sendBookingCancelled(phone: string, name: string, date: string, time: string): Promise<boolean> {
    const template = config.whatsapp.templates.bookingCancelled;
    if (!template) return Promise.resolve(false);
    return this.whatsapp.sendTemplate(phone, template, bookingCancelledParams(name, date, time));
  }

  sendAppointmentReminder(phone: string, time: string): Promise<boolean> {
    return this.whatsapp.sendTemplate(phone, config.whatsapp.templates.appointmentReminder, reminderParams(time));
  }

  sendNewBookingAlert(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.newBookingAlert,
      newBookingAlertParams(name, date, time),
    );
  }

  // Admin-facing, and equally unfallback-able — a booking-confirmation template would
  // tell Keren her own appointment was confirmed. Skip until a dedicated one exists.
  sendCancellationAlert(phone: string, name: string, date: string, time: string): Promise<boolean> {
    const template = config.whatsapp.templates.cancellationAlert;
    if (!template) return Promise.resolve(false);
    return this.whatsapp.sendTemplate(phone, template, cancellationAlertParams(name, date, time));
  }

  sendNewLeadAlert(phone: string, name: string, leadPhone: string, concern: string): Promise<boolean> {
    return this.whatsapp.sendTemplate(
      phone,
      config.whatsapp.templates.newLeadAlert,
      leadAlertParams(name, leadPhone, concern),
    );
  }
}
