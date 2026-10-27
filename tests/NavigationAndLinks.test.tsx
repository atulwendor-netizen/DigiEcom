import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RootLayout } from '../src/components/layout/RootLayout';
import categoriesData from '../src/data/categories.json';

describe('Navigation & Accessibility Baseline', () => {
  it('renders skip to main content link for keyboard accessibility', () => {
    render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    );

    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders main semantic landmarks (header, main, footer, nav)', () => {
    const { container } = render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    );

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main#main-content')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
    expect(container.querySelectorAll('nav').length).toBeGreaterThan(0);
  });

  it('verifies all category IDs match the 6 core defined categories', () => {
    const validCategoryIds = [
      'ebooks-guides',
      'ai-prompts',
      'business-templates',
      'productivity-tools',
      'design-assets',
      'other-downloads',
    ];

    expect(categoriesData.length).toBe(6);
    categoriesData.forEach((cat) => {
      expect(validCategoryIds).toContain(cat.id);
    });
  });

  it('verifies all footer policy links point to existing policy routes', () => {
    render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    );

    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toHaveAttribute('href', '/policies/privacy');

    const termsLink = screen.getByRole('link', { name: /Terms and Conditions/i });
    expect(termsLink).toHaveAttribute('href', '/policies/terms');

    const refundLink = screen.getByRole('link', { name: /Refund & Cancellation Policy/i });
    expect(refundLink).toHaveAttribute('href', '/policies/refunds');

    const deliveryLink = screen.getByRole('link', { name: /Digital Delivery Policy/i });
    expect(deliveryLink).toHaveAttribute('href', '/policies/delivery');

    const licenseLink = screen.getByRole('link', { name: /License & Usage Terms/i });
    expect(licenseLink).toHaveAttribute('href', '/policies/license');
  });
});
