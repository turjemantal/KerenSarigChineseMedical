import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { config } from '../../config';
import { toE164 } from '../../common/utils/phone.utils';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio | null = null;

  async sendSms(to: string, text: string): Promise<void> {
    if (config.isTest) {
      this.logger.log(`[SMS] TEST mode — skipping message to ${to}: "${text}"`);
      return;
    }

    const recipient = toE164(to);

    try {
      const message = await this.getClient().messages.create({
        from: config.twilio.fromNumber,
        to: recipient,
        body: text,
      });
      this.logger.log(`[SMS] Sent to ${recipient} (sid=${message.sid})`);
    } catch (e) {
      this.logger.error(`[SMS] Failed to send to ${recipient}: ${e}`);
    }
  }

  private getClient(): Twilio {
    if (!this.client) {
      const { accountSid, apiKeySid, apiKeySecret } = config.twilio;
      this.client = new Twilio(apiKeySid, apiKeySecret, { accountSid });
    }
    return this.client;
  }
}
