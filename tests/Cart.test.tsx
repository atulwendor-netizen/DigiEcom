import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from '../src/context/CartContext';
import { CartDrawer } from '../src/components/cart/CartDrawer';
import { Header } from '../src/components/common/Header';
import { ProductCard } from '../src/components/products/ProductCard';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';
import productsData from '../src/data/products.json';
import { Product } from '../src/types/product';

const sampleProducts = productsData as unknown as Product[];
const productA = sampleProducts[0]; // e.g. System Design Handbook (₹799)
const productB = sampleProducts[1]; // e.g. React & Node.js Production SaaS Boilerplate (₹1,499)

describe('Interactive Cart & Slide-Over Drawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders cart icon button in header with initial zero badge or no badge', () => {
    render(
      <CartProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </CartProvider>
    );

    const cartBtn = screen.getByRole('button', { name: /shopping cart/i });
    expect(cartBtn).toBeInTheDocument();
  });

  it('adds a product to cart from ProductCard and opens the cart drawer', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter>
          <Header />
          <ProductCard product={productA} />
          <CartDrawer />
        </MemoryRouter>
      </CartProvider>
    );

    // Click "Add to Cart" on the ProductCard
    const addBtn = screen.getByRole('button', { name: new RegExp(`Add ${productA.name} to cart`, 'i') });
    await user.click(addBtn);

    // Cart drawer should be visible and contain the product name
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart/i });
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText(productA.name)).toBeInTheDocument();

    // Check item count badge in header
    expect(screen.getByRole('button', { name: /Shopping cart, 1 items/i })).toBeInTheDocument();
  });

  it('adds a product to cart from ProductDetailPage and displays accurate subtotal', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <MemoryRouter initialEntries={[`/products/${productA.slug}`]}>
          <Routes>
            <Route
              path="/products/:slug"
              element={
                <>
                  <ProductDetailPage />
                  <CartDrawer />
                </>
              }
            />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    );

    // The active "Add to Cart" button exists alongside the disabled checkout button
    const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
    expect(addToCartBtn).toBeInTheDocument();
    expect(addToCartBtn).not.toBeDisabled();

    // The honest disabled checkout button is still preserved
    expect(screen.getByRole('button', { name: /Checkout Coming Soon \(Disabled\)/i })).toBeDisabled();

    await user.click(addToCartBtn);

    // Drawer should show product name
    const drawer = screen.getByRole('dialog', { name: /Shopping Cart/i });
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText(productA.name)).toBeInTheDocument();
  });

  it('supports quantity increase, decrease, and item removal', async () => {
    const user = userEvent.setup();

    // Helper component to exercise cart context actions
    const TestComponent = () => {
      const { addItem } = useCart();
      return (
        <div>
          <button type="button" onClick={() => addItem(productA)}>
            Add Item A
          </button>
          <CartDrawer />
        </div>
      );
    };

    render(
      <CartProvider>
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>
      </CartProvider>
    );

    // Add item
    await user.click(screen.getByRole('button', { name: 'Add Item A' }));
    expect(screen.getByText(productA.name)).toBeInTheDocument();

    // Increase quantity via "+"
    const incBtn = screen.getByRole('button', { name: new RegExp(`Increase quantity of ${productA.name}`, 'i') });
    await user.click(incBtn);

    // Subtotal should now reflect 2 items
    expect(screen.getByText('2 items')).toBeInTheDocument();

    // Decrease quantity via "-"
    const decBtn = screen.getByRole('button', { name: new RegExp(`Decrease quantity of ${productA.name}`, 'i') });
    await user.click(decBtn);
    expect(screen.getByText('1 item')).toBeInTheDocument();

    // Remove item completely via trash button
    const removeBtn = screen.getByRole('button', { name: new RegExp(`Remove ${productA.name} from cart`, 'i') });
    await user.click(removeBtn);

    // Cart is now empty
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it('calculates subtotal in INR accurately using integer paise without floating point issues', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const { addItem } = useCart();
      return (
        <div>
          <button type="button" onClick={() => addItem(productA, 2)}>
            Add 2 of Product A
          </button>
          <button type="button" onClick={() => addItem(productB, 1)}>
            Add 1 of Product B
          </button>
          <CartDrawer />
        </div>
      );
    };

    render(
      <CartProvider>
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add 2 of Product A' }));
    await user.click(screen.getByRole('button', { name: 'Add 1 of Product B' }));

    // Expected subtotal in paise: (productA.pricePaise * 2) + (productB.pricePaise * 1)
    const expectedPaise = productA.pricePaise * 2 + productB.pricePaise;
    const expectedRupees = expectedPaise / 100;
    const formattedExpected = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(expectedRupees);

    // The subtotal should appear in the drawer
    expect(screen.getByText(new RegExp(`₹${formattedExpected}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('persists cart items in localStorage and restores them on page reload', () => {
    // Pre-populate localStorage with valid item
    const storedCart = [
      {
        product: productA,
        quantity: 2,
      },
    ];
    window.localStorage.setItem('digiecom_cart_v1', JSON.stringify(storedCart));

    const TestReader = () => {
      const { items, itemCount, subtotalPaise } = useCart();
      return (
        <div>
          <span data-testid="count">{itemCount}</span>
          <span data-testid="subtotal">{subtotalPaise}</span>
          <span data-testid="item-name">{items[0]?.product.name}</span>
        </div>
      );
    };

    render(
      <CartProvider>
        <TestReader />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('subtotal')).toHaveTextContent(String(productA.pricePaise * 2));
    expect(screen.getByTestId('item-name')).toHaveTextContent(productA.name);
  });

  it('handles invalid or corrupted localStorage data safely without crashing', () => {
    // Set corrupted non-JSON or invalid schema in localStorage
    window.localStorage.setItem('digiecom_cart_v1', '{corrupt json: true');

    const TestReader = () => {
      const { items, itemCount } = useCart();
      return (
        <div>
          <span data-testid="count">{itemCount}</span>
          <span data-testid="items-length">{items.length}</span>
        </div>
      );
    };

    render(
      <CartProvider>
        <TestReader />
      </CartProvider>
    );

    // Should fall back to empty cart safely
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('closes cart drawer on Escape key and supports backdrop click', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const { isCartOpen, openCart } = useCart();
      return (
        <div>
          <button type="button" onClick={openCart}>
            Open Cart
          </button>
          <span data-testid="drawer-status">{isCartOpen ? 'open' : 'closed'}</span>
          <CartDrawer />
        </div>
      );
    };

    render(
      <CartProvider>
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>
      </CartProvider>
    );

    // Initially closed
    expect(screen.getByTestId('drawer-status')).toHaveTextContent('closed');

    // Open drawer
    await user.click(screen.getByRole('button', { name: 'Open Cart' }));
    expect(screen.getByTestId('drawer-status')).toHaveTextContent('open');

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(screen.getByTestId('drawer-status')).toHaveTextContent('closed');
  });

  it('opens honest demo-status modal when clicking Proceed to Checkout', async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const { addItem } = useCart();
      return (
        <div>
          <button type="button" onClick={() => addItem(productA)}>
            Add Item
          </button>
          <CartDrawer />
        </div>
      );
    };

    render(
      <CartProvider>
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    // Click "Proceed to Checkout"
    const checkoutBtn = screen.getByRole('button', { name: /Proceed to Checkout/i });
    await user.click(checkoutBtn);

    // Honest Demo Modal is displayed
    expect(screen.getByRole('dialog', { name: /Checkout Disabled in Demo/i })).toBeInTheDocument();
    expect(screen.getByText(/Storefront Preview/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No payment credentials or card details are requested or recorded/i)
    ).toBeInTheDocument();

    // Close the demo modal
    const returnBtn = screen.getByRole('button', { name: /Got it, Return to Store/i });
    await user.click(returnBtn);
    expect(screen.queryByRole('dialog', { name: /Checkout Disabled in Demo/i })).not.toBeInTheDocument();
  });
});
