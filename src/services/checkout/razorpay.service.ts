import type {
  RazorpayOrderRequest,
  RazorpayOrderResponse,
  RazorpayVerificationRequest,
  RazorpayVerificationResponse,
  RazorpayPaymentSuccessPayload,
  VerifiedOrder,
  RazorpayCustomerInfo,
} from '../../types/checkout';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface OpenRazorpayOptions {
  order: RazorpayOrderResponse;
  onSuccess: (verifiedOrder: VerifiedOrder) => void;
  onFailure: (errorMessage: string) => void;
  onDismiss?: () => void;
}

export class RazorpayService {
  private static scriptLoadingPromise: Promise<boolean> | null = null;

  /**
   * Dynamically loads the official Razorpay Checkout JS script.
   */
  public static async loadSDK(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check if already on window
    if ((window as any).Razorpay) {
      return true;
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve) => {
      const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Could not load external Razorpay checkout.js script (likely offline or blocked).');
        resolve(false);
      };
      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Checks whether Razorpay script is currently loaded and available.
   */
  public static isSDKLoaded(): boolean {
    return typeof window !== 'undefined' && Boolean((window as any).Razorpay);
  }

  /**
   * Creates an order securely on the backend server.
   * Supports both items array and direct amount in paise (minimum 100 paise).
   */
  public static async createOrder(
    input: RazorpayOrderRequest | Array<{ productId: string; quantity: number }> | { amount: number; currency?: string; receipt?: string },
    customerInfo?: RazorpayCustomerInfo
  ): Promise<RazorpayOrderResponse> {
    let payload: any;
    if (Array.isArray(input)) {
      payload = { items: input, customer: customerInfo };
    } else {
      payload = input;
      if (customerInfo && !payload.customer) {
        payload.customer = customerInfo;
      }
    }

    let res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Fallback if top-level endpoint is routed to /api/checkout/create-order
    if (!res.ok && res.status === 404) {
      res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Order creation failed with HTTP status ${res.status}`);
    }

    return (await res.json()) as RazorpayOrderResponse;
  }

  /**
   * Cryptographically verifies the payment on the backend with HMAC-SHA256.
   */
  public static async verifyPayment(
    data: RazorpayVerificationRequest
  ): Promise<RazorpayVerificationResponse> {
    let res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Fallback if top-level endpoint is routed to /api/checkout/verify-payment
    if (!res.ok && res.status === 404) {
      res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    const result = (await res.json().catch(() => ({
      success: false,
      verified: false,
      error: 'Invalid response from verification endpoint',
    }))) as RazorpayVerificationResponse;

    return result;
  }

  /**
   * Launches the official Razorpay Checkout modal with DigiEcom styling.
   */
  public static openCheckout(options: OpenRazorpayOptions): void {
    const { order, onSuccess, onFailure, onDismiss } = options;

    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      onFailure('Razorpay Checkout SDK is not available. Please ensure internet connectivity.');
      return;
    }

    try {
      const keyId =
        order.key_id ||
        order.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        'rzp_test_Ttgfx1HNEULoxH';

      const orderId = order.order_id || order.orderId || order.id;
      const amountPaise = order.amount !== undefined ? order.amount : order.amountPaise;

      const rzpOptions = {
        key: keyId,
        amount: amountPaise,
        currency: order.currency || 'INR',
        name: 'DigiEcom Marketplace',
        description: `Order ${orderId} • Instant Digital Goods`,
        order_id: orderId,
        prefill: {
          name: order.customer?.fullName || 'Valued Customer',
          email: order.customer?.email || 'guest@example.com',
          contact: order.customer?.phone || '9999999999',
        },
        theme: {
          color: '#bbf246', // DigiEcom signature neon-lime
          backdrop_color: 'rgba(10, 8, 20, 0.85)',
        },
        modal: {
          ondismiss: () => {
            onDismiss?.();
          },
          escape: true,
          backdropclose: false,
        },
        handler: async (response: RazorpayPaymentSuccessPayload) => {
          try {
            const verification = await RazorpayService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              items: order.items ? order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) : [],
              customer: order.customer,
            });

            if (verification.verified && verification.order) {
              onSuccess(verification.order);
            } else {
              onFailure(verification.error || 'Payment verification failed on server.');
            }
          } catch (err: any) {
            onFailure(err.message || 'Network error during payment verification.');
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(rzpOptions);

      razorpayInstance.on('payment.failed', (resp: any) => {
        onFailure(resp?.error?.description || resp?.error?.reason || 'Payment was declined or cancelled.');
      });

      razorpayInstance.open();
    } catch (err: any) {
      onFailure(err.message || 'Failed to initialize Razorpay modal.');
    }
  }
}
