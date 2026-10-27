import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';
import { NotFoundPage } from '../src/pages/NotFoundPage';

describe('Invalid Product Slug & 404 Handling', () => {
  it('renders a dedicated Product Not Found view when slug does not exist in catalogue', () => {
    render(
      <MemoryRouter initialEntries={['/products/invalid-nonexistent-book-slug-999']}>
        <Routes>
          <Route path="/products/:slug" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Product Not Found/i })).toBeInTheDocument();
    expect(
      screen.getByText(/We could not find any digital product matching the URL slug/i)
    ).toBeInTheDocument();
    expect(screen.getByText('invalid-nonexistent-book-slug-999')).toBeInTheDocument();

    // Link back to catalogue
    expect(screen.getByRole('link', { name: /Return to Catalogue/i })).toBeInTheDocument();
  });

  it('renders general 404 page for unmatched routes', () => {
    render(
      <MemoryRouter initialEntries={['/completely-unknown-route']}>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Digital Catalogue/i })).toBeInTheDocument();
  });
});
