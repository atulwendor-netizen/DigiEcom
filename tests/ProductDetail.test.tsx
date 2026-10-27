import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';

describe('Product Detail Page', () => {
  const renderProductDetail = (slug: string) => {
    return render(
      <MemoryRouter initialEntries={[`/products/${slug}`]}>
        <Routes>
          <Route path="/products/:slug" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders complete product metadata, inclusions, and breadcrumbs for a valid slug', () => {
    renderProductDetail('system-design-handbook-cloud-scale');

    // Title
    expect(
      screen.getByRole('heading', {
        name: /The Pragmatic System Design Handbook: Cloud-Scale Microservices/i,
      })
    ).toBeInTheDocument();

    // Price in INR
    expect(screen.getByText('₹799')).toBeInTheDocument();

    // Breadcrumbs
    expect(screen.getByLabelText(/Breadcrumb navigation/i)).toBeInTheDocument();

    // Formats & Compatibility
    expect(screen.getByText(/Apple Books, Kindle, Adobe Acrobat/i)).toBeInTheDocument();

    // What's Included checklist
    expect(screen.getByText(/340-page DRM-free digital handbook/i)).toBeInTheDocument();
    expect(screen.getByText(/High-resolution architectural blueprint posters/i)).toBeInTheDocument();

    // Back to catalogue link
    expect(screen.getByRole('link', { name: /Back to Catalogue/i })).toBeInTheDocument();
  });

  it('expands FAQ accordion when clicked', () => {
    renderProductDetail('system-design-handbook-cloud-scale');

    // First question is open by default
    expect(screen.getByText(/Are the diagrams vector format\?/i)).toBeInTheDocument();

    // Click to open the vector format question
    const vectorQuestionBtn = screen.getByRole('button', {
      name: /Are the diagrams vector format\?/i,
    });
    fireEvent.click(vectorQuestionBtn);

    // Answer text should be visible
    expect(
      screen.getByText(/All 85\+ architecture diagrams are embedded as crisp vector graphics/i)
    ).toBeInTheDocument();
  });

  it('renders related products from the same category', () => {
    renderProductDetail('system-design-handbook-cloud-scale');

    // Section title
    expect(screen.getByText(/More from E-books & Guides/i)).toBeInTheDocument();

    // Related product: Founders Playbook
    expect(screen.getByText(/Zero-to-One Founder Playbook/i)).toBeInTheDocument();
  });
});
