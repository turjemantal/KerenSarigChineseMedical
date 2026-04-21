import { Injectable, Logger } from '@nestjs/common';
import { WHATSAPP_API_BASE, WHATSAPP_API_VERSION, WHATSAPP_TEMPLATE_LANGUAGE } from './whatsapp.constants';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendTemplate(to: string, templateName: string, params: string[]): Promise<void> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      this.logger.warn(`[WhatsApp] ${templateName} → ${to} | params: ${params.join(', ')} (credentials not set)`);
      return;
    }

    const recipient = this.toInternational(to);
    const url = `${WHATSAPP_API_BASE}/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

    const body = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: WHATSAPP_TEMPLATE_LANGUAGE },
        components: params.length
          ? [{ type: 'body', parameters: params.map(text => ({ type: 'text', text })) }]
          : [],
      },
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

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`[WhatsApp] Failed to send "${templateName}" to ${recipient}: ${err}`);
      }
    } catch (e) {
      this.logger.error(`[WhatsApp] Network error sending "${templateName}" to ${recipient}: ${e}`);
    }
  }

  private toInternational(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('0') ? `972${digits.slice(1)}` : digits;
  }
}
