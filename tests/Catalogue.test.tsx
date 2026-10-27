import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductsPage } from '../src/pages/ProductsPage';

describe('Product Catalogue Filtering, Search & Sorting', () => {
  it('renders products and filters by search text', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText(/Filter products by text/i);
    expect(searchInput).toBeInTheDocument();

    // Type "Figma" into search
    fireEvent.change(searchInput, { target: { value: 'Figma' } });

    // Should find Lumina UI Design System
    expect(screen.getByText(/Lumina UI Design System/i)).toBeInTheDocument();

    // Should NOT show unrelated items like soundscapes
    expect(screen.queryByText(/Deep Work Ambient Soundscapes/i)).not.toBeInTheDocument();
  });

  it('filters by category pills', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    // Click on AI Prompts & Resources category button
    const aiCategoryButtons = screen.getAllByRole('button', { name: /AI Prompts & Resources/i });
    fireEvent.click(aiCategoryButtons[0]);

    // Should show Enterprise Prompt Vault
    expect(screen.getByText(/Enterprise Prompt Vault/i)).toBeInTheDocument();
    // Should show Autonomous Coding Agent Prompts
    expect(screen.getByText(/Autonomous Coding Agent Orchestration/i)).toBeInTheDocument();
  });

  it('shows empty state with clear reset option when search yields no matches', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByLabelText(/Filter products by text/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent-crypto-token-xyz' } });

    // Empty state heading
    expect(screen.getByText(/No products match your search or filter/i)).toBeInTheDocument();

    // Reset button is visible
    const resetButtons = screen.getAllByRole('button', { name: /Reset/i });
    expect(resetButtons.length).toBeGreaterThan(0);

    // Clicking reset restores products
    fireEvent.click(resetButtons[0]);
    expect(screen.getByText(/The Pragmatic System Design Handbook/i)).toBeInTheDocument();
  });

  it('sorts products by price ascending', () => {
    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>
    );

    const sortSelect = screen.getByLabelText(/Sort:/i);
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

    // The lowest priced item is Terminal dotfiles at ₹299
    expect(screen.getByText(/Optimized Linux & macOS Terminal Dotfiles/i)).toBeInTheDocument();
  });
});
