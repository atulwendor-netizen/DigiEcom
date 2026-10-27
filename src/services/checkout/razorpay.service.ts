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
   * Prices are calculated in integer paise server-side.
   */
  public static async createOrder(
    items: Array<{ productId: string; quantity: number }>,
    customer: RazorpayCustomerInfo
  ): Promise<RazorpayOrderResponse> {
    const payload: RazorpayOrderRequest = { items, customer };

    const res = await fetch('/api/checkout/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

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
    const res = await fetch('/api/checkout/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

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
      onFailure('Razorpay Checkout SDK is not available.');
      return;
    }

    try {
      const rzpOptions = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency || 'INR',
        name: 'DigiEcom Marketplace',
        description: `Order ${order.orderId} • Instant Digital Goods`,
        order_id: order.orderId,
        prefill: {
          name: order.customer.fullName,
          email: order.customer.email,
          contact: order.customer.phone || '9999999999',
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
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
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
        onFailure(resp?.error?.description || 'Payment was declined or cancelled.');
      });

      razorpayInstance.open();
    } catch (err: any) {
      onFailure(err.message || 'Failed to initialize Razorpay modal.');
    }
  }
}
