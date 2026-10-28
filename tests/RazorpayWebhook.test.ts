import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import {
  handleWebhookApi,
  verifyWebhookSignature,
  processRazorpayEvent,
  eventIdCache,
  verifiedEventLog,
} from '../server/webhookApi';

// Helper to simulate Node.js IncomingMessage (Readable stream)
function createMockRequest(options: {
  method?: string;
  headers?: Record<string, string>;
  rawBody?: string;
}) {
  const req = new EventEmitter() as any;
  req.method = options.method || 'POST';
  req.headers = options.headers || {};

  // Simulate streaming data and end
  process.nextTick(() => {
    if (options.rawBody !== undefined) {
      req.emit('data', Buffer.from(options.rawBody, 'utf8'));
    }
    req.emit('end');
  });

  return req;
}

// Helper to simulate Node.js ServerResponse
function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    setHeader(name: string, value: string) {
      res.headers[name.toLowerCase()] = value;
    },
    end(data?: string) {
      if (data) res.body = data;
    },
  } as any;
  return res;
}

// Helper to calculate valid Razorpay HMAC-SHA256 signature
function calculateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

describe('Razorpay Webhook Backend — Security, Verification & Idempotency', () => {
  const TEST_SECRET = 'rzp_test_whsec_k98234jhd89234jhdsf';
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.RAZORPAY_WEBHOOK_SECRET = TEST_SECRET;
    eventIdCache.clear();
    verifiedEventLog.length = 0;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('1. Valid signature: verifies payment.captured event and returns 200 OK', async () => {
    const rawPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test_capt_001',
            entity: 'payment',
            amount: 79900,
            currency: 'INR',
            status: 'captured',
            order_id: 'order_test_999',
            method: 'upi',
            email: 'customer@example.com',
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    });

    const signature = calculateSignature(rawPayload, TEST_SECRET);
    const req = createMockRequest({
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': 'evt_capt_test_001',
        'content-type': 'application/json',
      },
      rawBody: rawPayload,
    });
    const res = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res.end;
      res.end = function (...args: any[]) {
        originalEnd.apply(res, args);
        resolve();
      };
      handleWebhookApi(req, res);
    });

    expect(res.statusCode).toBe(200);
    const json = JSON.parse(res.body);
    expect(json.status).toBe('ok');
    expect(json.received).toBe(true);
    expect(json.eventType).toBe('payment.captured');
    expect(json.processingResult).toBe('captured');

    // Audit log recorded
    expect(verifiedEventLog.length).toBe(1);
    expect(verifiedEventLog[0].data.paymentId).toBe('pay_test_capt_001');
    expect(verifiedEventLog[0].data.amountPaise).toBe(79900);
  });

  it('2. Invalid signature: rejects request with 400 Bad Request / Unauthorized', async () => {
    const rawPayload = JSON.stringify({ event: 'payment.captured' });
    const wrongSignature = 'wrong_signature_hex_0000000000000000000000000000000000000000000000000000000000000000';

    const req = createMockRequest({
      method: 'POST',
      headers: {
        'x-razorpay-signature': wrongSignature,
        'content-type': 'application/json',
      },
      rawBody: rawPayload,
    });
    const res = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res.end;
      res.end = function (...args: any[]) {
        originalEnd.apply(res, args);
        resolve();
      };
      handleWebhookApi(req, res);
    });

    expect(res.statusCode).toBe(400);
    const json = JSON.parse(res.body);
    expect(json.error).toContain('Invalid X-Razorpay-Signature');
    expect(verifiedEventLog.length).toBe(0);
  });

  it('3. Missing signature: rejects with 400 Bad Request when header is omitted', async () => {
    const rawPayload = JSON.stringify({ event: 'payment.captured' });

    const req = createMockRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      rawBody: rawPayload,
    });
    const res = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res.end;
      res.end = function (...args: any[]) {
        originalEnd.apply(res, args);
        resolve();
      };
      handleWebhookApi(req, res);
    });

    expect(res.statusCode).toBe(400);
    const json = JSON.parse(res.body);
    expect(json.error).toContain('Missing X-Razorpay-Signature');
  });

  it('4. Malformed JSON: rejects with 400 Bad Request if signed body is invalid JSON', async () => {
    const malformedBody = '{"event": "payment.captured", "unterminated_string: ';
    const signature = calculateSignature(malformedBody, TEST_SECRET);

    const req = createMockRequest({
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
        'content-type': 'application/json',
      },
      rawBody: malformedBody,
    });
    const res = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res.end;
      res.end = function (...args: any[]) {
        originalEnd.apply(res, args);
        resolve();
      };
      handleWebhookApi(req, res);
    });

    expect(res.statusCode).toBe(400);
    const json = JSON.parse(res.body);
    expect(json.error).toContain('Malformed JSON payload');
  });

  it('5. Duplicate event delivery: handles duplicate x-razorpay-event-id idempotently', async () => {
    const eventId = 'evt_duplicate_test_101';
    const rawPayload = JSON.stringify({
      event: 'order.paid',
      payload: {
        order: {
          entity: {
            id: 'order_test_888',
            amount_paid: 129900,
            receipt: 'rcpt_test_01',
          },
        },
      },
    });
    const signature = calculateSignature(rawPayload, TEST_SECRET);

    // First delivery
    const req1 = createMockRequest({
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': eventId,
        'content-type': 'application/json',
      },
      rawBody: rawPayload,
    });
    const res1 = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res1.end;
      res1.end = function (...args: any[]) {
        originalEnd.apply(res1, args);
        resolve();
      };
      handleWebhookApi(req1, res1);
    });

    expect(res1.statusCode).toBe(200);
    expect(JSON.parse(res1.body).status).toBe('ok');
    expect(verifiedEventLog.length).toBe(1);

    // Duplicate delivery with same eventId
    const req2 = createMockRequest({
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
        'x-razorpay-event-id': eventId,
        'content-type': 'application/json',
      },
      rawBody: rawPayload,
    });
    const res2 = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res2.end;
      res2.end = function (...args: any[]) {
        originalEnd.apply(res2, args);
        resolve();
      };
      handleWebhookApi(req2, res2);
    });

    expect(res2.statusCode).toBe(200);
    const json2 = JSON.parse(res2.body);
    expect(json2.duplicate).toBe(true);
    expect(json2.message).toContain('Duplicate event already processed');
    // Ensure event log was not duplicated
    expect(verifiedEventLog.length).toBe(1);
  });

  it('6. Missing webhook secret configuration: returns 500 Server Configuration Error', async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;

    const rawPayload = JSON.stringify({ event: 'payment.captured' });
    const signature = calculateSignature(rawPayload, TEST_SECRET);

    const req = createMockRequest({
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
        'content-type': 'application/json',
      },
      rawBody: rawPayload,
    });
    const res = createMockResponse();

    await new Promise<void>((resolve) => {
      const originalEnd = res.end;
      res.end = function (...args: any[]) {
        originalEnd.apply(res, args);
        resolve();
      };
      handleWebhookApi(req, res);
    });

    expect(res.statusCode).toBe(500);
    const json = JSON.parse(res.body);
    expect(json.error).toContain('RAZORPAY_WEBHOOK_SECRET is not configured');
  });

  it('7. Handles payment.failed test event correctly', () => {
    const result = processRazorpayEvent(
      {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_fail_test_001',
              order_id: 'order_test_777',
              error_code: 'BAD_REQUEST_ERROR',
              error_description: 'Payment was cancelled by the customer on UPI app',
            },
          },
        },
      },
      'evt_failed_001'
    );

    expect(result.success).toBe(true);
    expect(result.status).toBe('failed');
    expect(result.message).toContain('Payment was cancelled');
    expect(verifiedEventLog.length).toBe(1);
    expect(verifiedEventLog[0].data.errorCode).toBe('BAD_REQUEST_ERROR');
  });

  it('8. Safely acknowledges unhandled Razorpay events with 200 OK without crashing', () => {
    const result = processRazorpayEvent({
      event: 'subscription.charged',
      payload: {},
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('ignored');
    expect(result.message).toContain('unhandled event');
  });

  it('9. Direct cryptographic verification with verifyWebhookSignature utility', () => {
    const raw = '{"test": "payload"}';
    const sig = calculateSignature(raw, TEST_SECRET);
    expect(verifyWebhookSignature(raw, sig, TEST_SECRET)).toBe(true);
    expect(verifyWebhookSignature(raw, 'bad_sig', TEST_SECRET)).toBe(false);
    expect(verifyWebhookSignature('', sig, TEST_SECRET)).toBe(false);
  });
});
