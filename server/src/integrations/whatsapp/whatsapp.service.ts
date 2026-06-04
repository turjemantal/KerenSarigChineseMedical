import { Injectable, Logger } from '@nestjs/common';
import { config } from '../../config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendTemplate(to: string, templateName: string, params: string[]): Promise<void> {
    const { accessToken, phoneNumberId, apiBase, apiVersion, templateLanguage } = config.whatsapp;

    if (!accessToken || !phoneNumberId || !templateLanguage) {
      this.logger.warn(`[WhatsApp] ${templateName} → ${to} | params: ${params.join(', ')} (credentials not set)`);
      return;
    }

    const recipient = this.toInternational(to);
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
        this.logger.log(`[WhatsApp] Sent "${templateName}" to ${recipient}: ${responseText}`);
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
