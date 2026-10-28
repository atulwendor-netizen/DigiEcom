import { describe, it, expect } from 'vitest';
import { supportChatService } from '../server/support/chatService';
import { SlidingWindowRateLimiter } from '../server/support/rateLimiter';
import { whatsappAdapter } from '../server/support/whatsappAdapter';
import { loadGroundedProducts, getStorePolicies } from '../server/support/groundingContext';

describe('AI Support Backend - Grounding & Knowledge Base', () => {
  it('loads the verified product catalogue from src/data/products.json', () => {
    const products = loadGroundedProducts();
    expect(products.length).toBeGreaterThanOrEqual(12);

    // Verify product structure
    const first = products[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('slug');
    expect(first).toHaveProperty('priceINR');
    expect(first).toHaveProperty('pricePaise');
    expect(first).toHaveProperty('compatibility');
    expect(first).toHaveProperty('contents');
  });

  it('reflects demonstration status and official support email in policies', () => {
    const policies = getStorePolicies();
    expect(policies.storeName).toBe('DigiEcom');
    expect(policies.supportEmail).toBe('digiecomsupport1@gmail.com');
    expect(policies.checkoutStatus).toContain('Disabled');
    expect(policies.storefrontStatus).toContain('Demonstration');
  });

  it('answers checkout questions grounded in preview policy without claiming real purchases', async () => {
    const response = await supportChatService.handleSupportMessage({
      message: 'Can I buy or checkout right now?',
    });

    expect(response.reply).toContain('Demonstration');
    expect(response.reply).toContain('disabled');
    expect(response.reply).toContain('digiecomsupport1@gmail.com');
    expect(response.isLiveAiConnected).toBe(false);
    expect(response.providerUsed).toBe('catalogue-fallback');
  });

  it('answers software compatibility questions accurately from catalogue', async () => {
    const response = await supportChatService.handleSupportMessage({
      message: 'What software compatibility requirements exist for your files?',
    });

    expect(response.reply).toContain('Excel');
    expect(response.reply).toContain('Figma');
    expect(response.suggestedFollowUps).toBeDefined();
    expect(response.suggestedFollowUps?.length).toBeGreaterThan(0);
  });

  it('recommends only catalogue items when searching for system design', async () => {
    const response = await supportChatService.handleSupportMessage({
      message: 'Do you have anything on system design?',
    });

    expect(response.reply).toContain('System Design');
    expect(response.recommendedProductSlugs).toContain('system-design-handbook-cloud-scale');
  });
});

describe('AI Support Backend - Multilingual & Hinglish Support', () => {
  it('detects Hinglish questions and replies in Hinglish', async () => {
    const lang = supportChatService.detectLanguage('kya checkout chal raha hai bhai?');
    expect(lang).toBe('hinglish');

    const response = await supportChatService.handleSupportMessage({
      message: 'kya checkout chal raha hai bhai?',
    });

    expect(response.languageDetected).toBe('hinglish');
    expect(response.reply).toMatch(/(Demonstration|disabled|filhal|asli)/i);
  });

  it('detects Hindi (Devanagari) questions', () => {
    const lang = supportChatService.detectLanguage('क्या चेकआउट उपलब्ध है?');
    expect(lang).toBe('hi');
  });

  it('defaults to English for English questions', () => {
    const lang = supportChatService.detectLanguage('What is included in the package?');
    expect(lang).toBe('en');
  });
});

describe('AI Support Backend - Security, Validation & Rate Limiting', () => {
  it('rejects empty or whitespace-only messages', () => {
    const validation = supportChatService.validateInput({ message: '   ' });
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('cannot be empty');
  });

  it('rejects messages exceeding 500 characters', () => {
    const longMessage = 'a'.repeat(501);
    const validation = supportChatService.validateInput({ message: longMessage });
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('exceeds maximum length of 500 characters');
  });

  it('warns user and never stores sensitive credit card submissions', async () => {
    const response = await supportChatService.handleSupportMessage({
      message: 'My card number is 4111 2222 3333 4444 and cvv 123',
    });

    expect(response.reply).toContain('Security');
    expect(response.reply).toContain('card');
  });

  it('enforces sliding window rate limits', () => {
    const testLimiter = new SlidingWindowRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 3,
    });

    const client = 'test-client-ip';

    const req1 = testLimiter.checkLimit(client);
    expect(req1.allowed).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = testLimiter.checkLimit(client);
    expect(req2.allowed).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = testLimiter.checkLimit(client);
    expect(req3.allowed).toBe(true);
    expect(req3.remaining).toBe(0);

    const req4 = testLimiter.checkLimit(client);
    expect(req4.allowed).toBe(false);
    expect(req4.remaining).toBe(0);

    testLimiter.destroy();
  });
});

describe('AI Support Backend - WhatsApp Business Platform Adapter', () => {
  it('validates webhook challenge handshake correctly', () => {
    const result = whatsappAdapter.verifyWebhook({
      mode: 'subscribe',
      token: process.env.WHATSAPP_VERIFY_TOKEN || 'digiecom_verify_token_preview',
      challenge: 'challenge_code_12345',
    });

    expect(result.isValid).toBe(true);
    expect(result.challenge).toBe('challenge_code_12345');
  });

  it('rejects invalid webhook token', () => {
    const result = whatsappAdapter.verifyWebhook({
      mode: 'subscribe',
      token: 'wrong-token',
      challenge: 'challenge_code_12345',
    });

    expect(result.isValid).toBe(false);
  });

  it('parses inbound WhatsApp payloads safely', () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                messages: [
                  {
                    from: '919876543210',
                    id: 'wamid.HBgL...',
                    timestamp: '1600000000',
                    text: { body: 'Is checkout working?' },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const parsed = whatsappAdapter.parseInboundMessages(payload);
    expect(parsed.length).toBe(1);
    expect(parsed[0].from).toBe('919876543210');
    expect(parsed[0].text?.body).toBe('Is checkout working?');
  });

  it('processes inbound message into a formatted WhatsApp response without fake API calls', async () => {
    const outbound = await whatsappAdapter.handleInboundMessage({
      from: '919876543210',
      id: 'msg-1',
      timestamp: '1600000000',
      type: 'text',
      text: { body: 'What is included in the package?' },
    });

    expect(outbound).not.toBeNull();
    expect(outbound?.recipient_type).toBe('individual');
    expect(outbound?.to).toBe('919876543210');
    expect(outbound?.text.body).toContain('Package Inclusions');

    // Dispatching without credentials should report dispatched: false without throwing
    const dispatch = await whatsappAdapter.sendOutboundMessage(outbound!);
    expect(dispatch.success).toBe(true);
    expect(dispatch.dispatched).toBe(false);
    expect(dispatch.reason).toContain('not configured');
  });
});
