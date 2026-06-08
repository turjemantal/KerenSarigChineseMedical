import { Injectable, Logger } from '@nestjs/common';
import { config } from '../../config';
import { toInternational } from '../../common/utils/phone.utils';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendTemplate(to: string, templateName: string, params: string[]): Promise<void> {
    if (config.isTest) {
      this.logger.log(`[WhatsApp] TEST mode — skipping "${templateName}" to ${to}`);
      return;
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
        this.logger.error(`[WhatsApp] Failed to send "${templateName}" to ${recipient}: ${responseText}`);
      } else {
        const messageId = JSON.parse(responseText)?.messages?.[0]?.id ?? 'unknown';
        this.logger.log(`[WhatsApp] Sent "${templateName}" to ${recipient} (id=${messageId})`);
      }
    } catch (e) {
      this.logger.error(`[WhatsApp] Network error sending "${templateName}" to ${recipient}: ${e}`);
    }
  }
}
