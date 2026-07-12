import { Injectable, Logger } from '@nestjs/common';
import { config } from '../../config';
import { maskPhone } from '../../common/utils/phone.utils';
import { SMS_019_API_URL, SMS_019_SUCCESS_STATUS } from '../../common/constants/sms.constants';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  // Resolves true on a successful hand-off (or a non-sending env), false on failure.
  async sendSms(to: string, text: string): Promise<boolean> {
    // TEST never sends (the suite must stay silent). DEV and PROD both send real
    // messages — DEV is for verifying the full flow end-to-end locally.
    if (config.isTest) {
      // never log the message text — it contains the recipient's name/details
      this.logger.log(`[SMS] TEST mode — skipping message to ${maskPhone(to)}`);
      return true;
    }

    const { username, token, sender } = config.sms019;
    // 019sms takes the local format (05XXXXXXXX) — exactly how phones are stored.
    // destinations.phone uses the xml2js text-node encoding: { _: <number> }.
    const body = {
      sms: {
        user: { username },
        source: sender,
        destinations: { phone: [{ _: to }] },
        message: text,
      },
    };

    try {
      const res = await fetch(SMS_019_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseText = await res.text();
      let parsed: { status?: number; shipment_id?: string } | null = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        // non-JSON body — treated as a failure below
      }
      if (!res.ok || parsed?.status !== SMS_019_SUCCESS_STATUS) {
        this.logger.error(`[SMS] Failed to send to ${maskPhone(to)}: ${responseText}`);
        return false;
      }
      this.logger.log(`[SMS] Sent to ${maskPhone(to)} (shipment=${parsed?.shipment_id ?? 'unknown'})`);
      return true;
    } catch (e) {
      this.logger.error(`[SMS] Network error sending to ${maskPhone(to)}: ${e}`);
      return false;
    }
  }
}
