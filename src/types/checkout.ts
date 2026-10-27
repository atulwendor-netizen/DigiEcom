/**
 * Checkout and Order Architecture Types
 *
 * NOTE: For the current storefront preview release, payment processing and digital
 * fulfillment are strictly disabled. The interfaces below define the future contract
 * between DigiEcom frontend and a secure, trusted backend service.
 */

export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'requires_action'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export interface CheckoutCustomerInfo {
  email: string;
  fullName: string;
  countryCode: string;
}

export interface CheckoutSessionRequest {
  productId: string;
  customer: CheckoutCustomerInfo;
  idempotencyKey: string;
  // Note: Prices are ALWAYS calculated and verified on the server side
}

export interface CheckoutSessionResponse {
  sessionId: string;
  orderId: string;
  providerCheckoutUrl: string;
  expiresAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  amountPaise: number;
  currency: 'INR';
}

export interface Order {
  id: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmountPaise: number;
  currency: 'INR';
  paymentStatus: PaymentStatus;
  paymentGatewayProvider: 'razorpay' | 'stripe' | 'cashfree' | 'unconfigured';
  gatewayTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  fulfilledAt?: string;
}

export interface CheckoutFeatureStatus {
  isEnabled: boolean;
  reason: string;
  maintenanceNotice: string;
}
