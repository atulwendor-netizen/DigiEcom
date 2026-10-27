import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createOrder, verifyPayment } from '../server/checkoutApi';
import { RazorpayCheckoutModal } from '../src/components/checkout/RazorpayCheckoutModal';
import { OrderConfirmationModal } from '../src/components/checkout/OrderConfirmationModal';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';
import { CartProvider } from '../src/context/CartContext';
import type { VerifiedOrder } from '../src/types/checkout';
import productsData from '../src/data/products.json';

describe('Razorpay Payment Gateway Architecture & Order Processing', () => {
  const sampleProductA = productsData[0];
  const sampleProductB = productsData[1];

  it('calculates order totals server-side in integer paise from product catalog', async () => {
    const order = await createOrder({
      items: [
        { productId: sampleProductA.id, quantity: 2 },
        { productId: sampleProductB.id, quantity: 1 },
      ],
      customer: {
        fullName: 'Anant Sharma',
        email: 'anant@example.com',
        phone: '9876543210',
      },
    });

    const expectedTotal = sampleProductA.pricePaise * 2 + sampleProductB.pricePaise * 1;

    expect(order.success).toBe(true);
    expect(order.amountPaise).toBe(expectedTotal);
    expect(order.currency).toBe('INR');
    expect(order.orderId).toBeDefined();
    expect(order.receipt).toMatch(/^rcpt_/);
    expect(order.items.length).toBe(2);
    expect(order.items[0].amountPaise).toBe(sampleProductA.pricePaise * 2);
    expect(order.items[1].amountPaise).toBe(sampleProductB.pricePaise * 1);
  });

  it('rejects order creation if a requested product ID does not exist in backend catalog', async () => {
    await expect(
      createOrder({
        items: [{ productId: 'invalid-nonexistent-sku', quantity: 1 }],
        customer: { fullName: 'Test', email: 'test@example.com' },
      })
    ).rejects.toThrow(/Product not found in catalog/i);
  });

  it('verifies payment and returns instant digital deliverables with license keys', async () => {
    const verification = await verifyPayment({
      orderId: 'order_test_999888',
      paymentId: 'pay_test_777666',
      signature: 'test_sig_valid_hash_123',
      items: [{ productId: sampleProductA.id, quantity: 1 }],
      customer: {
        fullName: 'Anant Sharma',
        email: 'anant@example.com',
      },
    });

    expect(verification.success).toBe(true);
    expect(verification.verified).toBe(true);
    expect(verification.order).toBeDefined();

    const order = verification.order!;
    expect(order.id).toBe('order_test_999888');
    expect(order.paymentId).toBe('pay_test_777666');
    expect(order.status).toBe('succeeded');
    expect(order.provider).toBe('razorpay');
    expect(order.amountPaise).toBe(sampleProductA.pricePaise);

    // Deliverables check
    expect(order.deliverables.length).toBe(1);
    expect(order.deliverables[0].productId).toBe(sampleProductA.id);
    expect(order.deliverables[0].downloadUrl).toContain('/api/checkout/download');
    expect(order.deliverables[0].licenseKey).toMatch(/^DGE-[A-Z0-9]+-[A-Z0-9]+/);
    expect(order.deliverables[0].expiresIn).toContain('30 days');
  });

  it('rejects payment verification when required orderId or paymentId is missing', async () => {
    const result = await verifyPayment({
      orderId: '',
      paymentId: '',
      signature: 'test_sig',
      items: [],
      customer: { fullName: '', email: '' },
    });

    expect(result.success).toBe(false);
    expect(result.verified).toBe(false);
    expect(result.error).toContain('Missing required orderId or paymentId');
  });

  it('renders RazorpayCheckoutModal with customer form and price breakdown in INR', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <RazorpayCheckoutModal
        isOpen={true}
        onClose={onClose}
        items={[
          {
            productId: sampleProductA.id,
            productName: sampleProductA.name,
            quantity: 1,
            pricePaise: sampleProductA.pricePaise,
          },
        ]}
        subtotalPaise={sampleProductA.pricePaise}
        onPaymentSuccess={onSuccess}
      />
    );

    // Razorpay branding badge
    expect(screen.getByText('RAZORPAY')).toBeInTheDocument();
    expect(screen.getByText(/Official Payment Gateway/i)).toBeInTheDocument();
    expect(screen.getByText(/256-Bit SSL/i)).toBeInTheDocument();

    // Customer form inputs
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();

    // Payment trigger button
    expect(screen.getByRole('button', { name: /Pay .* with Razorpay/i })).toBeInTheDocument();
  });

  it('renders OrderConfirmationModal with verified badge, deliverables, and license keys', async () => {
    const onClose = vi.fn();
    const mockVerifiedOrder: VerifiedOrder = {
      id: 'order_test_verified_123',
      paymentId: 'pay_test_verified_456',
      amountPaise: 79900,
      currency: 'INR',
      status: 'succeeded',
      provider: 'razorpay',
      customer: {
        fullName: 'Priya Patel',
        email: 'priya@example.com',
      },
      items: [
        {
          productId: sampleProductA.id,
          productName: sampleProductA.name,
          quantity: 1,
          amountPaise: 79900,
        },
      ],
      deliverables: [
        {
          productId: sampleProductA.id,
          productName: sampleProductA.name,
          downloadUrl: '/api/checkout/download?token=test-token-123',
          fileFormat: '.pdf, .epub',
          fileSize: '16.4 MB',
          licenseKey: 'DGE-TEST-KEY1',
          expiresIn: 'Valid for 30 days • 5 download attempts remaining',
        },
      ],
      receiptId: 'rcpt_test_123',
      createdAt: '2026-10-27T10:00:00Z',
    };

    render(
      <OrderConfirmationModal
        isOpen={true}
        order={mockVerifiedOrder}
        onClose={onClose}
      />
    );

    // Order confirmation header
    expect(screen.getByText(/Order Confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Verified • Instant Delivery/i)).toBeInTheDocument();

    // Order IDs
    expect(screen.getByText('order_test_verified_123')).toBeInTheDocument();
    expect(screen.getByText('pay_test_verified_456')).toBeInTheDocument();
    expect(screen.getByText('priya@example.com')).toBeInTheDocument();

    // Deliverables
    expect(screen.getByText(sampleProductA.name)).toBeInTheDocument();
    expect(screen.getByText('DGE-TEST-KEY1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download/i })).toHaveAttribute(
      'href',
      '/api/checkout/download?token=test-token-123'
    );

    // Print Receipt and Continue Shopping buttons
    expect(screen.getByRole('button', { name: /Print Receipt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue Shopping/i })).toBeInTheDocument();
  });

  it('renders Instant Buy with Razorpay button on ProductDetailPage', () => {
    render(
      <CartProvider>
        <MemoryRouter initialEntries={[`/products/${sampleProductA.slug}`]}>
          <Routes>
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    );

    // Instant Buy with Razorpay button exists and is clickable
    const buyNowBtn = screen.getByRole('button', { name: /Instant Buy with Razorpay/i });
    expect(buyNowBtn).toBeInTheDocument();
    expect(buyNowBtn).not.toBeDisabled();

    // Clicking it opens the Razorpay checkout modal
    fireEvent.click(buyNowBtn);
    expect(screen.getByRole('dialog', { name: /Complete Your Purchase/i })).toBeInTheDocument();
  });
});
