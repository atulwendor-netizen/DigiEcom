import type { IncomingMessage, ServerResponse } from 'http';
import { supportChatService } from './support/chatService';
import { supportRateLimiter } from './support/rateLimiter';
import { whatsappAdapter } from './support/whatsappAdapter';
import type { SupportChatRequest } from './support/types';

export function handleSupportApi(req: IncomingMessage, res: ServerResponse): void {
  // Setup standard CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse relative URL
  const rawUrl = req.url || '/';
  const parsedUrl = new URL(rawUrl, 'http://localhost');
  const pathname = parsedUrl.pathname;

  // 1. GET /api/support/health or /health
  if (req.method === 'GET' && (pathname === '/health' || pathname.endsWith('/health'))) {
    const hasGemini = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder');
    const hasOpenAI = !!process.env.AI_API_KEY && !process.env.AI_API_KEY.includes('placeholder');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'DigiEcom AI Customer Support',
        activeProvider: hasGemini ? 'gemini' : hasOpenAI ? 'openai-compatible' : 'catalogue-fallback',
        isLiveAiConnected: hasGemini || hasOpenAI,
        storefrontStatus: 'Demonstration Preview Only',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // 2. GET /api/support/whatsapp (Meta Webhook Handshake)
  if (req.method === 'GET' && (pathname === '/whatsapp' || pathname.endsWith('/whatsapp'))) {
    const mode = parsedUrl.searchParams.get('hub.mode') || undefined;
    const token = parsedUrl.searchParams.get('hub.verify_token') || undefined;
    const challenge = parsedUrl.searchParams.get('hub.challenge') || undefined;

    const verification = whatsappAdapter.verifyWebhook({ mode, token, challenge });
    if (verification.isValid && verification.challenge) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(verification.challenge);
      return;
    }

    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Webhook verification token mismatch or invalid mode' }));
    return;
  }

  // Read request body for POST routes
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      let parsedBody: any = {};
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload' }));
          return;
        }
      }

      // 3. POST /api/support/chat
      if (req.method === 'POST' && (pathname === '/chat' || pathname.endsWith('/chat') || pathname === '')) {
        // Rate limiting check
        const forwarded = req.headers['x-forwarded-for'];
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() ||
          req.socket.remoteAddress ||
          'unknown-client';

        const rateCheck = supportRateLimiter.checkLimit(ip);
        if (!rateCheck.allowed) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Retry-After', Math.ceil(rateCheck.resetMs / 1000).toString());
          res.end(
            JSON.stringify({
              success: false,
              error: 'Rate limit exceeded. Please wait a moment before sending another message.',
              resetMs: rateCheck.resetMs,
            })
          );
          return;
        }

        const chatRequest = parsedBody as SupportChatRequest;
        const validation = supportChatService.validateInput(chatRequest);
        if (!validation.isValid) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: validation.error }));
          return;
        }

        const response = await supportChatService.handleSupportMessage(chatRequest);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, data: response }));
        return;
      }

      // 4. POST /api/support/whatsapp (Incoming WhatsApp message webhook)
      if (req.method === 'POST' && (pathname === '/whatsapp' || pathname.endsWith('/whatsapp'))) {
        const messages = whatsappAdapter.parseInboundMessages(parsedBody);
        const results = [];

        for (const msg of messages) {
          const outbound = await whatsappAdapter.handleInboundMessage(msg);
          if (outbound) {
            const dispatchResult = await whatsappAdapter.sendOutboundMessage(outbound);
            results.push({ to: msg.from, outbound, dispatchResult });
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'EVENT_RECEIVED', processed: results.length, details: results }));
        return;
      }

      // 404 Not Found
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Support API route not found: ${pathname}` }));
    } catch (err: any) {
      console.error('[Support API error]:', err?.message || err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'An internal error occurred while processing the support request.',
        })
      );
    }
  });
}
