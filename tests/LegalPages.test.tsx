import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AboutPage } from '../src/pages/AboutPage';
import { ContactPage } from '../src/pages/ContactPage';
import { PrivacyPolicyPage } from '../src/pages/policies/PrivacyPolicyPage';
import { TermsPage } from '../src/pages/policies/TermsPage';
import { RefundPolicyPage } from '../src/pages/policies/RefundPolicyPage';
import { DeliveryPolicyPage } from '../src/pages/policies/DeliveryPolicyPage';
import { LicensePolicyPage } from '../src/pages/policies/LicensePolicyPage';

describe('Legal & Support Pages Integrity', () => {
  it('renders About page with mission and storefront release status', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Digital Tools Built for Builders/i })).toBeInTheDocument();
    expect(screen.getByText(/Storefront Architecture & Current Release/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Hyperbolic Claims/i)).toBeInTheDocument();
  });

  it('renders Contact page with honest communication placeholders and operating hours', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Contact DigiEcom Support/i })).toBeInTheDocument();
    expect(screen.getByText(/\[support@yourdomain.com\]/i)).toBeInTheDocument();
    expect(screen.getByText(/Operating Hours/i)).toBeInTheDocument();
  });

  it('renders Privacy Policy with draft disclaimer and jurisdiction placeholders', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Starter Legal Template Notice:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\[Legal Entity Name\]/i).length).toBeGreaterThan(0);
  });

  it('renders Terms and Conditions with disclaimer of guarantees', () => {
    render(
      <MemoryRouter>
        <TermsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Terms and Conditions/i })).toBeInTheDocument();
    expect(screen.getByText(/Disclaimer of Professional Advice & Guarantees/i)).toBeInTheDocument();
  });

  it('renders Refund and Cancellation Policy reflecting digital goods practices', () => {
    render(
      <MemoryRouter>
        <RefundPolicyPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Refund and Cancellation Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Intangible Nature of Digital Products/i)).toBeInTheDocument();
  });

  it('renders Digital Delivery Policy detailing secure signed URLs', () => {
    render(
      <MemoryRouter>
        <DeliveryPolicyPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Digital Delivery Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Secure Signed URLs & Download Expiration/i)).toBeInTheDocument();
  });

  it('renders License Policy defining personal vs commercial team tiers', () => {
    render(
      <MemoryRouter>
        <LicensePolicyPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Product License and Acceptable Use Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Single-User Personal \/ Developer License/i)).toBeInTheDocument();
    expect(screen.getByText(/Commercial Team \/ Workspace License/i)).toBeInTheDocument();
    expect(screen.getByText(/Strictly Prohibited Activities/i)).toBeInTheDocument();
  });
});
