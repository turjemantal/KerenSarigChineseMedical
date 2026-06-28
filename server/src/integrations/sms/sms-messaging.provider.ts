import { Injectable } from '@nestjs/common';
import { SmsService } from './sms.service';
import { IMessagingProvider } from '../messaging/messaging-provider.interface';
import { smsOtpText, smsBookingText, smsBookingRequestText, smsBookingRejectedText, smsReminderText, smsNewBookingAlertText, smsNewLeadAlertText } from '../../common/constants/messages.constants';
import { config } from '../../config';

@Injectable()
export class SmsMessagingProvider implements IMessagingProvider {
  constructor(private readonly sms: SmsService) {}

  sendOtp(phone: string, code: string): Promise<boolean> {
    const domain = new URL(config.clientUrl).hostname;
    return this.sms.sendSms(phone, smsOtpText(code, domain));
  }

  sendBookingRequestReceived(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.sms.sendSms(phone, smsBookingRequestText(name, date, time));
  }

  sendBookingConfirmation(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.sms.sendSms(phone, smsBookingText(name, date, time));
  }

  sendBookingRejected(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.sms.sendSms(phone, smsBookingRejectedText(name, date, time));
  }

  sendAppointmentReminder(phone: string, time: string): Promise<boolean> {
    return this.sms.sendSms(phone, smsReminderText(time));
  }

  sendNewBookingAlert(phone: string, name: string, date: string, time: string): Promise<boolean> {
    return this.sms.sendSms(phone, smsNewBookingAlertText(name, date, time));
  }

  sendNewLeadAlert(phone: string, name: string, leadPhone: string, concern: string): Promise<boolean> {
    return this.sms.sendSms(phone, smsNewLeadAlertText(name, leadPhone, concern));
  }
}
