import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductsPage } from '../src/pages/ProductsPage';
import { ProductCard } from '../src/components/products/ProductCard';
import { CartProvider } from '../src/context/CartContext';
import { CartDrawer } from '../src/components/cart/CartDrawer';
import productsData from '../src/data/products.json';
import { Product } from '../src/types/product';

const sampleProducts = productsData as unknown as Product[];
const productA = sampleProducts[0]; // System Design Handbook

describe('Option 2: Advanced Catalogue Filters & Quick Preview Modal', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('File Format Filtering', () => {
    it('filters products by file format', () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );

      const formatSelect = screen.getByLabelText(/Filter by file format/i);
      expect(formatSelect).toBeInTheDocument();

      // Filter by Figma (.fig)
      fireEvent.change(formatSelect, { target: { value: '.fig' } });

      // Should show Figma products
      expect(screen.getByText(/Lumina UI Design System/i)).toBeInTheDocument();

      // Should NOT show Terminal dotfiles (.sh / .zsh)
      expect(screen.queryByText(/Optimized Linux & macOS Terminal Dotfiles/i)).not.toBeInTheDocument();
    });

    it('filters by audio formats correctly', () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );

      const formatSelect = screen.getByLabelText(/Filter by file format/i);
      fireEvent.change(formatSelect, { target: { value: '.mp3' } });

      // Should show Deep Work Ambient Soundscapes
      expect(screen.getByText(/Deep Work Ambient Soundscapes/i)).toBeInTheDocument();

      // Should NOT show Figma kits
      expect(screen.queryByText(/Lumina UI Design System/i)).not.toBeInTheDocument();
    });
  });

  describe('Budget & Price Range Slider Filtering', () => {
    it('filters products using budget shortcut buttons', () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );

      // Click "Under ₹500" shortcut
      const under500Btn = screen.getByRole('button', { name: /Under ₹500/i });
      fireEvent.click(under500Btn);

      // Terminal dotfiles is ₹299 (29900 paise) so it must appear
      expect(screen.getByText(/Optimized Linux & macOS Terminal Dotfiles/i)).toBeInTheDocument();

      // React SaaS Boilerplate is ₹1,499 so it must NOT appear
      expect(screen.queryByText(/Production SaaS Boilerplate/i)).not.toBeInTheDocument();
    });

    it('filters products using the interactive price range slider', () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );

      const slider = screen.getByLabelText(/Filter products by maximum price/i);
      expect(slider).toBeInTheDocument();

      // Set max price to ₹800 (80000 paise)
      fireEvent.change(slider, { target: { value: '80000' } });

      // ₹799 product should be visible
      expect(screen.getByText(/The Pragmatic System Design Handbook/i)).toBeInTheDocument();

      // ₹1,499 product should not be visible
      expect(screen.queryByText(/Production SaaS Boilerplate/i)).not.toBeInTheDocument();
    });
  });

  describe('Active Filter Chips and Reset', () => {
    it('displays active filter chips with individual dismiss buttons', () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );

      // Select Category
      const aiBtn = screen.getAllByRole('button', { name: /AI Prompts & Resources/i })[0];
      fireEvent.click(aiBtn);

      // Select Format
      const formatSelect = screen.getByLabelText(/Filter by file format/i);
      fireEvent.change(formatSelect, { target: { value: '.json' } });

      // Active chips container should have remove buttons
      const removeCategoryBtn = screen.getByRole('button', { name: /Remove category filter/i });
      expect(removeCategoryBtn).toBeInTheDocument();

      const removeFormatBtn = screen.getByRole('button', { name: /Remove format filter/i });
      expect(removeFormatBtn).toBeInTheDocument();

      // Dismiss format filter
      fireEvent.click(removeFormatBtn);
      expect(screen.queryByRole('button', { name: /Remove format filter/i })).not.toBeInTheDocument();
    });

    it('clears all filters when clicking Reset', () => {
      render(
        <MemoryRouter>
          <ProductsPage />
        </MemoryRouter>
      );

      // Apply search and format
      const searchInput = screen.getByLabelText(/Filter products by text/i);
      fireEvent.change(searchInput, { target: { value: 'SaaS' } });

      const formatSelect = screen.getByLabelText(/Filter by file format/i);
      fireEvent.change(formatSelect, { target: { value: '.zip' } });

      // Reset button should be visible
      const resetBtn = screen.getByRole('button', { name: /Reset all search and category filters/i });
      fireEvent.click(resetBtn);

      // Reset restores all products
      expect(screen.getByText(/The Pragmatic System Design Handbook/i)).toBeInTheDocument();
      expect(screen.getByText(/Optimized Linux & macOS Terminal Dotfiles/i)).toBeInTheDocument();
    });
  });

  describe('Quick View Modal', () => {
    it('opens Quick View modal with product metadata and inclusions', async () => {
      const user = userEvent.setup();

      render(
        <CartProvider>
          <MemoryRouter>
            <ProductCard product={productA} />
          </MemoryRouter>
        </CartProvider>
      );

      // Click Quick View Preview button
      const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${productA.name}`, 'i') });
      await user.click(previewBtn);

      // Modal dialog is displayed
      const modal = screen.getByRole('dialog', { name: /System Design Handbook/i });
      expect(modal).toBeInTheDocument();

      // Check contents inside modal
      expect(within(modal).getByText(productA.shortDescription)).toBeInTheDocument();
      expect(within(modal).getByText(/Package Contents:/i)).toBeInTheDocument();
      expect(within(modal).getByText(new RegExp(productA.licenseType, 'i'))).toBeInTheDocument();

      // Close modal using close button
      const closeBtn = screen.getByRole('button', { name: /Close quick view/i });
      await user.click(closeBtn);

      expect(screen.queryByRole('dialog', { name: /System Design Handbook/i })).not.toBeInTheDocument();
    });

    it('adds product to cart directly from the Quick View modal', async () => {
      const user = userEvent.setup();

      render(
        <CartProvider>
          <MemoryRouter>
            <ProductCard product={productA} />
            <CartDrawer />
          </MemoryRouter>
        </CartProvider>
      );

      // Open Quick View
      const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${productA.name}`, 'i') });
      await user.click(previewBtn);

      const modal = screen.getByRole('dialog', { name: /System Design Handbook/i });
      expect(modal).toBeInTheDocument();

      // Click "Add to Cart" inside the Quick View modal
      const modalAddBtn = within(modal).getByRole('button', { name: /Add to Cart/i });
      await user.click(modalAddBtn);

      // Modal closes, Cart Drawer opens, product is inside Cart Drawer
      const cartDrawer = screen.getByRole('dialog', { name: /Shopping Cart/i });
      expect(cartDrawer).toBeInTheDocument();
      expect(within(cartDrawer).getByText(productA.name)).toBeInTheDocument();
    });

    it('closes Quick View modal when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <CartProvider>
          <MemoryRouter>
            <ProductCard product={productA} />
          </MemoryRouter>
        </CartProvider>
      );

      // Open Quick View
      const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${productA.name}`, 'i') });
      await user.click(previewBtn);

      expect(screen.getByRole('dialog', { name: /System Design Handbook/i })).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(screen.queryByRole('dialog', { name: /System Design Handbook/i })).not.toBeInTheDocument();
    });
  });
});
