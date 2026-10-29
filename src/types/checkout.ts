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

// ==========================================
// Razorpay Payment Gateway & Order Architecture
// ==========================================

export interface RazorpayCustomerInfo {
  fullName: string;
  email: string;
  phone?: string;
}

export interface RazorpayOrderRequest {
  amount?: number; // Integer paise
  currency?: string;
  receipt?: string;
  items?: Array<{
    productId: string;
    quantity: number;
  }>;
  customer?: RazorpayCustomerInfo;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  success: boolean;
  order_id: string;
  id: string;
  orderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  key_id: string;
  keyId: string;
  receipt: string;
  customer?: RazorpayCustomerInfo;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPricePaise: number;
    amountPaise: number;
  }>;
  isSandboxMode?: boolean;
}

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerificationRequest {
  order_id?: string;
  payment_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  orderId?: string;
  paymentId?: string;
  signature?: string;
  items?: Array<{
    productId: string;
    quantity: number;
  }>;
  customer?: RazorpayCustomerInfo;
}

export interface OrderDeliverable {
  productId: string;
  productName: string;
  downloadUrl: string;
  fileFormat: string;
  fileSize: string;
  licenseKey: string;
  expiresIn: string;
}

export interface VerifiedOrder {
  id: string;
  paymentId: string;
  amountPaise: number;
  currency: 'INR';
  status: 'succeeded' | 'failed';
  provider: 'razorpay';
  customer: RazorpayCustomerInfo;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    amountPaise: number;
  }>;
  deliverables: OrderDeliverable[];
  receiptId: string;
  createdAt: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  verified: boolean;
  order?: VerifiedOrder;
  error?: string;
}
