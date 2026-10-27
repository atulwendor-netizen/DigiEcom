import {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CheckoutFeatureStatus,
  Order,
} from '../../types/checkout';

/**
 * Checkout Service Architecture Boundary
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. For this storefront preview, all payment processing is deliberately DISABLED.
 * 2. In a future production release, all prices MUST be calculated and verified
 *    on a trusted server-side backend. Client-side amounts must never be trusted.
 * 3. Payment verification must occur via provider webhooks with cryptographically
 *    signed payloads, never via client-side redirect query parameters.
 * 4. Fulfillment must be idempotent to prevent duplicate deliveries.
 */

export const CHECKOUT_FEATURE_STATUS: CheckoutFeatureStatus = {
  isEnabled: false,
  reason: 'Storefront preview release — payment provider is not configured.',
  maintenanceNotice:
    'Checkout is currently disabled. This is a demonstration storefront. No real transactions are processed.',
};

export class CheckoutService {
  /**
   * Returns current operational status of the checkout system.
   */
  public static getStatus(): CheckoutFeatureStatus {
    return CHECKOUT_FEATURE_STATUS;
  }

  /**
   * Intended to initiate a server-side checkout session once payment gateway is configured.
   * Throws an explicit error in this storefront preview to guarantee no pretend orders are created.
   */
  public static async initiateCheckout(
    _request: CheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> {
    throw new Error(
      'CheckoutDisabledError: Payment gateway integration is not configured in this storefront release. Real payments and simulated transactions are disabled.'
    );
  }

  /**
   * Verifies an order on the backend. Always rejects in storefront preview.
   */
  public static async verifyOrderPayment(_orderId: string): Promise<Order> {
    throw new Error(
      'PaymentVerificationError: No payment provider webhook listener is active.'
    );
  }
}
