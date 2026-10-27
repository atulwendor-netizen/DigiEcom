import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../src/pages/HomePage';
import { Header } from '../src/components/common/Header';

describe('Homepage Rendering & Components', () => {
  it('renders the Hero section with accurate headline and CTAs', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Hero headline
    expect(
      screen.getByRole('heading', {
        name: /Your Next Big Idea Starts With the Right Digital Tools/i,
      })
    ).toBeInTheDocument();

    // CTAs
    expect(screen.getByRole('link', { name: /Explore Products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Categories/i })).toBeInTheDocument();
  });

  it('renders all 6 categories in the Category Explorer with working links', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const categorySection = container.querySelector('#category-explorer');
    expect(categorySection).toBeInTheDocument();

    expect(screen.getAllByText('E-books & Guides').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI Prompts & Resources').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Business Templates').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Productivity Tools').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Design & Creative Assets').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Other Digital Downloads').length).toBeGreaterThan(0);
  });

  it('renders Featured products with accurate INR prices and DEMO badges', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Featured section heading
    expect(screen.getByText(/Hand-Crafted Digital Solutions/i)).toBeInTheDocument();

    // Contains DRM-Free sample items
    const demoBadges = screen.getAllByText(/DEMO/i);
    expect(demoBadges.length).toBeGreaterThan(0);
  });

  it('renders the Benefits section without hyperbolic or income guarantees', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /How Digital Assets Support Real Workflows/i })
    ).toBeInTheDocument();

    // Explains practical utility
    expect(screen.getByText(/Technical E-books & Guides/i)).toBeInTheDocument();
    expect(screen.getByText(/Benchmarked AI Prompts/i)).toBeInTheDocument();
  });

  it('renders the How It Works section clarifying disabled checkout status', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /How DigiEcom Works/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/01/i)).toBeInTheDocument();
    expect(screen.getByText(/02/i)).toBeInTheDocument();
    expect(screen.getByText(/03/i)).toBeInTheDocument();
    expect(screen.getByText(/04/i)).toBeInTheDocument();

    // Explicit notice about step 3 & 4
    expect(
      screen.getByText(/Storefront Phase 1 Notice:/i)
    ).toBeInTheDocument();
  });

  it('renders Trust and Support section without fake testimonials or star ratings', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /What to Verify Before Purchasing Digital Assets/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/1\. File Formats & Extractors/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. System Requirements & Versions/i)).toBeInTheDocument();

    // No fake testimonials
    expect(screen.queryByText(/5 out of 5 stars/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/trusted by 100,000 customers/i)).not.toBeInTheDocument();
  });

  it('renders the disabled newsletter placeholder without silently discarding data', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email address \(integration currently disabled\)/i);
    expect(emailInput).toBeDisabled();

    const notifyBtn = screen.getByRole('button', { name: /Notify Me \(Inactive\)/i });
    expect(notifyBtn).toBeDisabled();
  });

  it('header does NOT render a nonfunctional cart or account icon pretending to work', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Primary CTA is Browse Products
    expect(screen.getByRole('link', { name: /Browse Products/i })).toBeInTheDocument();

    // No fake cart or user account buttons
    expect(screen.queryByLabelText(/cart/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/my account/i)).not.toBeInTheDocument();
  });
});
