import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { config } from '../../config';
import { toE164, maskPhone } from '../../common/utils/phone.utils';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio | null = null;

  // Resolves true on a successful hand-off (or a non-sending env), false on failure.
  async sendSms(to: string, text: string): Promise<boolean> {
    // TEST never sends (the suite must stay silent). DEV and PROD both send real
    // messages — DEV is for verifying the full flow end-to-end locally.
    if (config.isTest) {
      // never log the message text — it contains the recipient's name/details
      this.logger.log(`[SMS] TEST mode — skipping message to ${maskPhone(to)}`);
      return true;
    }

    const recipient = toE164(to);

    try {
      const message = await this.getClient().messages.create({
        from: config.twilio.fromNumber,
        to: recipient,
        body: text,
      });
      this.logger.log(`[SMS] Sent to ${maskPhone(recipient)} (sid=${message.sid})`);
      return true;
    } catch (e) {
      this.logger.error(`[SMS] Failed to send to ${maskPhone(recipient)}: ${e}`);
      return false;
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
