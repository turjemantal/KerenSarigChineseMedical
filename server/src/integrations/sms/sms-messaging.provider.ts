import { Injectable } from '@nestjs/common';
import { SmsService } from './sms.service';
import { IMessagingProvider } from '../messaging/messaging-provider.interface';
import { smsOtpText, smsBookingText, smsReminderText } from '../../common/constants/messages.constants';

@Injectable()
export class SmsMessagingProvider implements IMessagingProvider {
  constructor(private readonly sms: SmsService) {}

  sendOtp(phone: string, code: string): Promise<void> {
    return this.sms.sendSms(phone, smsOtpText(code));
  }

  sendBookingConfirmation(phone: string, name: string, date: string, time: string): Promise<void> {
    return this.sms.sendSms(phone, smsBookingText(name, date, time));
  }

  sendAppointmentReminder(phone: string, time: string): Promise<void> {
    return this.sms.sendSms(phone, smsReminderText(time));
  }
}
