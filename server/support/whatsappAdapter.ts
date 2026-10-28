import type { SupportChatResponse } from './types';
import { supportChatService } from './chatService';

export interface WhatsAppInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: string;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: WhatsAppInboundMessage[];
      };
      field?: string;
    }>;
  }>;
}

export interface WhatsAppOutboundMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export class WhatsAppAdapter {
  private verifyToken: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'digiecom_verify_token_preview';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  /**
   * Validates the Meta / WhatsApp Cloud API webhook challenge handshake (GET request).
   */
  public verifyWebhook(params: {
    mode?: string;
    token?: string;
    challenge?: string;
  }): { isValid: boolean; challenge?: string } {
    if (params.mode === 'subscribe' && params.token && params.token === this.verifyToken) {
      return {
        isValid: true,
        challenge: params.challenge,
      };
    }
    return { isValid: false };
  }

  /**
   * Parses inbound webhook payload, safely extracting messages.
   */
  public parseInboundMessages(payload: WhatsAppWebhookPayload): WhatsAppInboundMessage[] {
    if (!payload || payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
      return [];
    }

    const messages: WhatsAppInboundMessage[] = [];
    for (const entry of payload.entry) {
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          const incoming = change?.value?.messages;
          if (Array.isArray(incoming)) {
            for (const msg of incoming) {
              if (msg && msg.from && msg.text?.body) {
                messages.push(msg);
              }
            }
          }
        }
      }
    }

    return messages;
  }

  /**
   * Formats response text specifically for mobile WhatsApp messaging.
   * Converts markdown links [Name](/products/slug) to readable WhatsApp format.
   */
  public formatForWhatsApp(response: SupportChatResponse): string {
    let text = response.reply;

    // Convert markdown links like [Title](/products/slug) to "Title (https://digiecom.preview/products/slug)"
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

    // Add suggested questions if present
    if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
      text += `\n\nSuggested questions:\n${response.suggestedFollowUps.map((q) => `• ${q}`).join('\n')}`;
    }

    // Keep WhatsApp responses concise (under 1000 characters)
    if (text.length > 1000) {
      text = text.substring(0, 995) + '...';
    }

    return text;
  }

  /**
   * Processes an incoming WhatsApp text message through the unified chat service
   * and prepares the outbound WhatsApp Cloud API payload.
   */
  public async handleInboundMessage(message: WhatsAppInboundMessage): Promise<WhatsAppOutboundMessage | null> {
    const text = message.text?.body?.trim();
    if (!text) {
      return null;
    }

    // Dispatch to the grounded chat service
    const supportResult = await supportChatService.handleSupportMessage({
      message: text,
    });

    const formattedBody = this.formatForWhatsApp(supportResult);

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.from,
      type: 'text',
      text: {
        preview_url: false,
        body: formattedBody,
      },
    };
  }

  /**
   * Sends a message via the Meta WhatsApp Cloud API if credentials are configured.
   * If credentials are not configured, returns a mock dispatch result without making fake network calls.
   */
  public async sendOutboundMessage(outbound: WhatsAppOutboundMessage): Promise<{ success: boolean; dispatched: boolean; messageId?: string; reason?: string }> {
    if (!this.accessToken || !this.phoneNumberId) {
      return {
        success: true,
        dispatched: false,
        reason: 'WhatsApp API credentials not configured in environment. Outbound message created but not sent.',
      };
    }

    try {
      const endpoint = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(outbound),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          dispatched: false,
          reason: `Meta API returned ${response.status}: ${errorText.substring(0, 150)}`,
        };
      }

      const data = (await response.json()) as { messages?: Array<{ id: string }> };
      return {
        success: true,
        dispatched: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      return {
        success: false,
        dispatched: false,
        reason: err.message || 'Network error sending WhatsApp message',
      };
    }
  }
}

export const whatsappAdapter = new WhatsAppAdapter();
