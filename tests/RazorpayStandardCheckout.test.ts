import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { createOrder, verifyPayment, verifyRazorpaySignature } from '../server/checkoutApi';

describe('Razorpay Standard Web Checkout Integration', () => {
  const TEST_KEY_SECRET = 'xM6rFBaWsQINL3Tm4FXi7jnO';
  const TEST_KEY_ID = 'rzp_test_Ttgfx1HNEULoxH';

  describe('STEP 1: Order Creation (POST /api/create-order)', () => {
    it('creates an order with valid amount (>= 100 paise) returning order_id, amount, and currency', async () => {
      process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

      const originalFetch = global.fetch;
      global.fetch = (async (url: any, opts: any) => {
        if (typeof url === 'string' && url.includes('/v1/orders')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              id: 'order_test_unit_mock_123',
              amount: 25000,
              currency: 'INR',
              receipt: 'rcpt_test_unit_1',
              status: 'created',
            }),
          } as any;
        }
        return originalFetch(url, opts);
      }) as any;

      try {
        const response = await createOrder({
          amount: 25000, // 250 INR in paise
          currency: 'INR',
          receipt: 'rcpt_test_unit_1',
        });

        expect(response.success).toBe(true);
        expect(response.order_id).toBeDefined();
        expect(response.order_id).toMatch(/^(order_|order_test_)/);
        expect(response.amount).toBe(25000);
        expect(response.currency).toBe('INR');
        expect(response.receipt).toBe('rcpt_test_unit_1');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('rejects order creation if amount is less than 100 paise (< 1 INR)', async () => {
      process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

      await expect(
        createOrder({
          amount: 50, // 50 paise is less than minimum 100 paise
          currency: 'INR',
        })
      ).rejects.toThrow(/Amount must be at least 100 paise/i);
    });

    it('rejects order creation if neither amount nor items are provided', async () => {
      process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

      await expect(
        createOrder({} as any)
      ).rejects.toThrow(/requires either items or amount/i);
    });

    it('returns 401 error if Razorpay credentials are not configured', async () => {
      const origId = process.env.RAZORPAY_KEY_ID;
      const origSecret = process.env.RAZORPAY_KEY_SECRET;
      const origVite = process.env.VITE_RAZORPAY_KEY_ID;

      try {
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        delete process.env.VITE_RAZORPAY_KEY_ID;

        await expect(
          createOrder({ amount: 5000, currency: 'INR' })
        ).rejects.toMatchObject({
          status: 401,
          message: expect.stringMatching(/authentication failed/i),
        });
      } finally {
        process.env.RAZORPAY_KEY_ID = origId;
        process.env.RAZORPAY_KEY_SECRET = origSecret;
        process.env.VITE_RAZORPAY_KEY_ID = origVite;
      }
    });
  });

  describe('STEP 2 & 3: Signature Verification (POST /api/verify-payment)', () => {
    it('verifies HMAC-SHA256 signature matching order_id + "|" + payment_id', async () => {
      process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

      const orderId = 'order_test_rzp_12345';
      const paymentId = 'pay_test_rzp_67890';
      const expectedSignature = crypto
        .createHmac('sha256', TEST_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const result = await verifyPayment({
        order_id: orderId,
        payment_id: paymentId,
        signature: expectedSignature,
      });

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.order_id).toBe(orderId);
      expect(result.payment_id).toBe(paymentId);
    });

    it('rejects signature mismatch with HTTP 400 and does NOT mark order as paid', async () => {
      process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

      const orderId = 'order_test_rzp_12345';
      const paymentId = 'pay_test_rzp_67890';
      const forgedSignature = 'forged_tampered_hex_signature_0000000000000000000000000000000000000000';

      const result = await verifyPayment({
        order_id: orderId,
        payment_id: paymentId,
        signature: forgedSignature,
      });

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/signature mismatch/i);
      expect(result.error).toContain('Order not marked as paid');
    });

    it('rejects verification if required order_id, payment_id, or signature is missing', async () => {
      process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
      process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

      const resultMissingSig = await verifyPayment({
        order_id: 'order_test_123',
        payment_id: 'pay_test_456',
        signature: '',
      });

      expect(resultMissingSig.success).toBe(false);
      expect(resultMissingSig.verified).toBe(false);
      expect(resultMissingSig.status).toBe(400);
      expect(resultMissingSig.error).toContain('Missing required fields');
    });

    it('cryptographic helper correctly validates valid vs invalid signatures using timing-safe equal', () => {
      const orderId = 'order_abc123';
      const paymentId = 'pay_xyz789';
      const secret = 'super_secret_test_key_321';

      const validSig = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      expect(verifyRazorpaySignature(orderId, paymentId, validSig, secret)).toBe(true);

      const invalidSig = validSig.replace(/^[a-f0-9]/, (c) => (c === 'a' ? 'b' : 'a'));
      expect(verifyRazorpaySignature(orderId, paymentId, invalidSig, secret)).toBe(false);
      expect(verifyRazorpaySignature(orderId, paymentId, '', secret)).toBe(false);
      expect(verifyRazorpaySignature(orderId, '', validSig, secret)).toBe(false);
    });
  });
});
