import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../src/context/CartContext';
import { ProductCard } from '../src/components/products/ProductCard';
import { ProductQuickViewModal } from '../src/components/products/ProductQuickViewModal';
import { CartDrawer } from '../src/components/cart/CartDrawer';
import { forceResetScrollLocks, getActiveScrollLockCount } from '../src/utils/scrollLock';
import { Product } from '../src/types/product';

const sampleProduct: Product = {
  id: 'de-prod-test',
  slug: 'test-product-slug',
  name: 'Test Architectural Systems Playbook',
  category: 'ebooks-guides',
  categoryLabel: 'E-books & Guides',
  shortDescription: 'Practitioner guide covering high-concurrency event-driven architectures.',
  fullDescription: 'Comprehensive systems engineering reference with case studies.',
  pricePaise: 79900,
  currency: 'INR',
  coverVisualType: 'playbook',
  coverGradient: 'linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)',
  gallery: ['Overview Diagram', 'Architecture Sheet'],
  fileFormats: ['.pdf', '.epub'],
  compatibility: 'Compatible with all modern PDF/EPUB readers.',
  contents: ['340-page DRM-free digital handbook', 'Vector architectural blueprint posters'],
  licenseType: 'Single-user personal license',
  deliveryMethod: 'Instant download',
  publicationStatus: 'published',
  isFeatured: true,
  createdAt: '2026-08-15T10:00:00Z',
  faqs: [],
  tags: ['Systems', 'Architecture'],
  isDemoContent: true,
  demoNotice: 'Demonstration catalogue item',
};

describe('Product Quick View Modal & Portal Functionality', () => {
  beforeEach(() => {
    forceResetScrollLocks();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  afterEach(() => {
    forceResetScrollLocks();
  });

  it('renders preview modal inside document.body via a portal, outside the card container', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter>
          <div data-testid="card-wrapper" style={{ transform: 'translateY(-10px)', overflow: 'hidden' }}>
            <ProductCard product={sampleProduct} />
          </div>
        </MemoryRouter>
      </CartProvider>
    );

    const cardWrapper = screen.getByTestId('card-wrapper');

    // Click Preview button
    const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${sampleProduct.name}`, 'i') });
    await user.click(previewBtn);

    // Modal dialog is rendered in document.body
    const dialog = screen.getByRole('dialog', { name: new RegExp(sampleProduct.name, 'i') });
    expect(dialog).toBeInTheDocument();

    // Verify modal is NOT a child of the transformed card wrapper (it is portaled to document.body)
    expect(cardWrapper.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);

    // Verify dialog has accessible close button
    const closeBtn = screen.getByRole('button', { name: /Close quick view/i });
    expect(closeBtn).toBeInTheDocument();
  });

  it('closes when clicking the close button and restores body scroll', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter>
          <ProductCard product={sampleProduct} />
        </MemoryRouter>
      </CartProvider>
    );

    const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${sampleProduct.name}`, 'i') });
    await user.click(previewBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    // Click Close
    const closeBtn = screen.getByRole('button', { name: /Close quick view/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('closes when pressing the Escape key', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter>
          <ProductCard product={sampleProduct} />
        </MemoryRouter>
      </CartProvider>
    );

    const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${sampleProduct.name}`, 'i') });
    await user.click(previewBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Fire Escape keydown
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes when clicking the backdrop, but NOT when clicking inside the modal dialog', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter>
          <ProductCard product={sampleProduct} />
        </MemoryRouter>
      </CartProvider>
    );

    const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${sampleProduct.name}`, 'i') });
    await user.click(previewBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Click inside the dialog
    await user.click(dialog);
    // Dialog must remain open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click the backdrop (presentation role)
    const backdrop = document.querySelector('.quickview-backdrop');
    expect(backdrop).toBeInTheDocument();
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('restores body overflow styles cleanly when component unmounts unexpectedly', () => {
    const TestHost: React.FC<{ mounted: boolean }> = ({ mounted }) => {
      if (!mounted) return null;
      return (
        <CartProvider>
          <MemoryRouter>
            <ProductQuickViewModal product={sampleProduct} isOpen={true} onClose={() => {}} />
          </MemoryRouter>
        </CartProvider>
      );
    };

    const { rerender } = render(<TestHost mounted={true} />);

    // Body should be locked
    expect(document.body.style.overflow).toBe('hidden');
    expect(getActiveScrollLockCount()).toBe(1);

    // Unmount unexpectedly (e.g. page navigation)
    rerender(<TestHost mounted={false} />);

    // Scroll lock must be cleaned up
    expect(getActiveScrollLockCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('coordinates scroll lock with CartDrawer without conflicting or unlocking prematurely', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter>
          <ProductCard product={sampleProduct} />
          <CartDrawer />
        </MemoryRouter>
      </CartProvider>
    );

    // Open Quick View
    const previewBtn = screen.getByRole('button', { name: new RegExp(`Quick view ${sampleProduct.name}`, 'i') });
    await user.click(previewBtn);

    const quickViewDialog = screen.getByRole('dialog', { name: new RegExp(sampleProduct.name, 'i') });
    expect(quickViewDialog).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    // Click "Add to Cart" inside Quick View
    const addBtn = within(quickViewDialog).getByRole('button', { name: /Add to Cart/i });
    await user.click(addBtn);

    // Quick View closes, CartDrawer opens
    expect(screen.queryByRole('dialog', { name: new RegExp(sampleProduct.name, 'i') })).not.toBeInTheDocument();
    const cartDialog = screen.getByRole('dialog', { name: /Shopping Cart/i });
    expect(cartDialog).toBeInTheDocument();

    // Body overflow MUST still be locked for CartDrawer
    expect(document.body.style.overflow).toBe('hidden');

    // Close CartDrawer
    const closeCartBtn = screen.getByRole('button', { name: /Close cart/i });
    await user.click(closeCartBtn);

    // Now all locks are released and body scroll is restored
    expect(screen.queryByRole('dialog', { name: /Shopping Cart/i })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });
});
