import { Injectable, Logger } from '@nestjs/common';
import { config } from '../../config';
import { toInternational, maskPhone } from '../../common/utils/phone.utils';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  // Resolves true on a successful hand-off (or a non-sending env), false on failure.
  async sendTemplate(to: string, templateName: string, params: string[]): Promise<boolean> {
    // TEST never sends (the suite must stay silent). DEV and PROD both send real
    // messages — DEV is for verifying the full flow end-to-end locally.
    if (config.isTest) {
      this.logger.log(`[WhatsApp] TEST mode — skipping "${templateName}" to ${maskPhone(to)}`);
      return true;
    }

    const { accessToken, phoneNumberId, apiBase, apiVersion, templateLanguage } = config.whatsapp;
    const recipient = toInternational(to);
    const url = `${apiBase}/${apiVersion}/${phoneNumberId}/messages`;

    const template: Record<string, unknown> = {
      name: templateName,
      language: { code: templateLanguage },
    };
    if (params.length) {
      template.components = [{ type: 'body', parameters: params.map(text => ({ type: 'text', text })) }];
    }

    const body = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseText = await res.text();
      if (!res.ok) {
        this.logger.error(`[WhatsApp] Failed to send "${templateName}" to ${maskPhone(recipient)}: ${responseText}`);
        return false;
      }
      const messageId = JSON.parse(responseText)?.messages?.[0]?.id ?? 'unknown';
      this.logger.log(`[WhatsApp] Sent "${templateName}" to ${maskPhone(recipient)} (id=${messageId})`);
      return true;
    } catch (e) {
      this.logger.error(`[WhatsApp] Network error sending "${templateName}" to ${maskPhone(recipient)}: ${e}`);
      return false;
    }
  }
}
