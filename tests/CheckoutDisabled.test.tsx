import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';
import { CheckoutService, CHECKOUT_FEATURE_STATUS } from '../src/services/checkout/checkout.service';

describe('Disabled Checkout Architecture Verification', () => {
  it('displays an honest disabled purchase button with explanatory status', () => {
    render(
      <MemoryRouter initialEntries={['/products/system-design-handbook-cloud-scale']}>
        <Routes>
          <Route path="/products/:slug" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Purchase button is disabled
    const purchaseButton = screen.getByRole('button', {
      name: /Checkout Coming Soon \(Disabled\)/i,
    });
    expect(purchaseButton).toBeDisabled();
    expect(purchaseButton).toHaveAttribute('aria-disabled', 'true');

    // Warning notice is present
    expect(
      screen.getByText(/Checkout Disabled in Storefront Preview:/i)
    ).toBeInTheDocument();
  });

  it('verifies checkout feature status reports disabled flag and reasons', () => {
    const status = CheckoutService.getStatus();
    expect(status.isEnabled).toBe(false);
    expect(status.reason).toContain('payment provider is not configured');
    expect(CHECKOUT_FEATURE_STATUS.isEnabled).toBe(false);
  });

  it('rejects initiateCheckout with CheckoutDisabledError to prevent simulated orders', async () => {
    await expect(
      CheckoutService.initiateCheckout({
        productId: 'de-prod-001',
        customer: {
          email: 'test@example.com',
          fullName: 'Test User',
          countryCode: 'IN',
        },
        idempotencyKey: 'idemp-12345',
      })
    ).rejects.toThrow(/CheckoutDisabledError/i);
  });

  it('rejects verifyOrderPayment to prevent fake client-side success screens', async () => {
    await expect(
      CheckoutService.verifyOrderPayment('fake-order-id-999')
    ).rejects.toThrow(/PaymentVerificationError/i);
  });

  it('does NOT render fake card input fields or payment collection forms', () => {
    render(
      <MemoryRouter initialEntries={['/products/system-design-handbook-cloud-scale']}>
        <Routes>
          <Route path="/products/:slug" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByPlaceholderText(/card number/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/cvv/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/upi id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/order confirmed/i)).not.toBeInTheDocument();
  });
});
