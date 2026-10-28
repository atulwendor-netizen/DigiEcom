import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * LRU / TTL in-memory cache for tracking x-razorpay-event-id to ensure idempotent delivery
 */
export class WebhookEventCache {
  private processedEvents = new Map<string, number>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  public has(eventId: string): boolean {
    this.cleanup();
    return this.processedEvents.has(eventId);
  }

  public add(eventId: string): void {
    this.cleanup();
    this.processedEvents.set(eventId, Date.now());
  }

  public clear(): void {
    this.processedEvents.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    if (this.processedEvents.size > 2000) {
      for (const [id, timestamp] of this.processedEvents.entries()) {
        if (now - timestamp > this.ttlMs) {
          this.processedEvents.delete(id);
        }
      }
    }
  }
}

export const eventIdCache = new WebhookEventCache();

/**
 * Verifies Razorpay Webhook HMAC-SHA256 signature using timing-safe comparison.
 * The signature MUST be computed over the untouched raw request body bytes.
 */
export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  secret: string
): boolean {
  if (!rawBody || !receivedSignature || !secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(receivedSignature, 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (err) {
    console.error('Cryptographic signature verification error:', err);
    return false;
  }
}

/**
 * Log of verified webhook events (in-memory for demo / sandbox audit)
 */
export interface ProcessedWebhookEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  data: Record<string, any>;
  status: 'captured' | 'failed' | 'order_paid' | 'ignored';
}

export const verifiedEventLog: ProcessedWebhookEvent[] = [];

/**
 * Handles verified Razorpay Test Mode webhook events.
 * Supported events: payment.captured, payment.failed, order.paid
 */
export function processRazorpayEvent(
  payload: any,
  eventId: string = `evt_${Date.now()}`
): { success: boolean; eventType: string; status: string; message: string } {
  const eventType = payload.event;

  switch (eventType) {
    case 'payment.captured': {
      const payment = payload.payload?.payment?.entity;
      if (!payment || !payment.id) {
        return {
          success: false,
          eventType,
          status: 'invalid_payload',
          message: 'Missing payment entity in payment.captured payload',
        };
      }

      verifiedEventLog.push({
        eventId,
        eventType,
        timestamp: new Date().toISOString(),
        status: 'captured',
        data: {
          paymentId: payment.id,
          orderId: payment.order_id,
          amountPaise: payment.amount,
          currency: payment.currency,
          method: payment.method,
          email: payment.email,
        },
      });

      return {
        success: true,
        eventType,
        status: 'captured',
        message: `Payment ${payment.id} captured successfully for order ${payment.order_id || 'unassigned'}`,
      };
    }

    case 'payment.failed': {
      const payment = payload.payload?.payment?.entity;
      verifiedEventLog.push({
        eventId,
        eventType,
        timestamp: new Date().toISOString(),
        status: 'failed',
        data: {
          paymentId: payment?.id,
          orderId: payment?.order_id,
          errorCode: payment?.error_code,
          errorDescription: payment?.error_description,
        },
      });

      return {
        success: true,
        eventType,
        status: 'failed',
        message: `Payment ${payment?.id || 'unknown'} failure logged: ${payment?.error_description || 'unspecified'}`,
      };
    }

    case 'order.paid': {
      const order = payload.payload?.order?.entity;
      verifiedEventLog.push({
        eventId,
        eventType,
        timestamp: new Date().toISOString(),
        status: 'order_paid',
        data: {
          orderId: order?.id,
          amountPaidPaise: order?.amount_paid,
          receipt: order?.receipt,
        },
      });

      return {
        success: true,
        eventType,
        status: 'order_paid',
        message: `Order ${order?.id || 'unknown'} marked as paid`,
      };
    }

    default: {
      return {
        success: true,
        eventType: eventType || 'unknown',
        status: 'ignored',
        message: `Event type ${eventType || 'unknown'} safely acknowledged (unhandled event)`,
      };
    }
  }
}

/**
 * Node HTTP / Express / Vite / Vercel Serverless entrypoint for POST /api/webhooks/razorpay
 */
export function handleWebhookApi(req: IncomingMessage, res: ServerResponse): void {
  // CORS & method safeguards
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Razorpay-Signature, x-razorpay-event-id');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Only POST is permitted
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed. Razorpay webhooks require POST.' }));
    return;
  }

  // Security: Check that server-side webhook secret is configured
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim() === '') {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Server Configuration Error: RAZORPAY_WEBHOOK_SECRET is not configured on the server.',
      })
    );
    return;
  }

  // Read signature from request headers (Node HTTP lowercases headers automatically)
  const signature = (req.headers['x-razorpay-signature'] as string) || '';
  if (!signature || signature.trim() === '') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Bad Request: Missing X-Razorpay-Signature header' }));
    return;
  }

  // Extract event ID for duplicate suppression (optional header provided by Razorpay)
  const eventIdHeader = (req.headers['x-razorpay-event-id'] as string) || '';

  // Accumulate the exact untouched raw body buffer
  let rawBody = '';
  req.on('data', (chunk: Buffer | string) => {
    rawBody += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
  });

  req.on('end', () => {
    try {
      // 1. Cryptographic HMAC-SHA256 signature verification over exact raw request body
      const isSignatureValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isSignatureValid) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid X-Razorpay-Signature' }));
        return;
      }

      // 2. Parse JSON payload safely after signature verification
      let payload: any;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Bad Request: Malformed JSON payload' }));
        return;
      }

      // 3. Idempotent deduplication check
      const eventId = eventIdHeader || payload.event_id || payload.payload?.payment?.entity?.id || '';
      if (eventId && eventIdCache.has(eventId)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            message: 'Duplicate event already processed (idempotent acknowledgement)',
            eventId,
            duplicate: true,
          })
        );
        return;
      }

      if (eventId) {
        eventIdCache.add(eventId);
      }

      // 4. Process the verified event
      const result = processRazorpayEvent(payload, eventId);

      // Return 200 OK to acknowledge receipt to Razorpay
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          status: 'ok',
          received: true,
          eventType: result.eventType,
          processingResult: result.status,
          message: result.message,
        })
      );
    } catch (err: any) {
      console.error('Webhook execution failure:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error during webhook processing' }));
    }
  });
}
