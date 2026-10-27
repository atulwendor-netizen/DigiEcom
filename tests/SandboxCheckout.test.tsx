import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartProvider, useCart } from '../src/context/CartContext';
import { CartDrawer } from '../src/components/cart/CartDrawer';
import { CheckoutSimulatorModal } from '../src/components/cart/CheckoutSimulatorModal';
import { SandboxCheckoutService } from '../src/services/checkout/sandboxCheckout.service';
import productsData from '../src/data/products.json';
import { Product } from '../src/types/product';

const sampleProducts = productsData as unknown as Product[];
const productA = sampleProducts[0];

describe('Option 3: Sandbox Checkout & Order Confirmation Simulation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('generates a unique sandbox order ID and saves order history to localStorage', () => {
    const order = SandboxCheckoutService.createOrder(
      { fullName: 'Tester', email: 'test@example.com', country: 'India' },
      [{ product: productA, quantity: 1 }],
      productA.pricePaise,
      'test_upi'
    );

    expect(order.id).toMatch(/^DIGI-SBX-[A-Z0-9]+$/);
    expect(order.subtotalPaise).toBe(productA.pricePaise);
    expect(order.customer.email).toBe('test@example.com');

    const history = SandboxCheckoutService.getOrderHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(order.id);
  });

  it('launches simulator from drawer and runs complete 3-step checkout simulation', async () => {
    const user = userEvent.setup();

    const TestHost = () => {
      const { addItem } = useCart();
      return (
        <div>
          <button type="button" onClick={() => addItem(productA)}>
            Add Test Item
          </button>
          <CartDrawer />
        </div>
      );
    };

    render(
      <CartProvider>
        <MemoryRouter>
          <TestHost />
        </MemoryRouter>
      </CartProvider>
    );

    // 1. Add item to cart
    await user.click(screen.getByRole('button', { name: 'Add Test Item' }));

    // 2. Open Demo Modal via "Proceed to Checkout"
    const checkoutBtn = screen.getByRole('button', { name: /Proceed to Checkout/i });
    await user.click(checkoutBtn);

    // 3. Launch Simulator from Demo Modal
    const launchSimulatorBtn = screen.getByRole('button', { name: /Launch 3-Step Sandbox Checkout Simulator/i });
    expect(launchSimulatorBtn).toBeInTheDocument();
    await user.click(launchSimulatorBtn);

    // Step 1: Contact form is active
    expect(screen.getByRole('heading', { name: /Customer & Delivery Details/i })).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Full Name \*/i);
    const emailInput = screen.getByLabelText(/Delivery Email Address \*/i);

    fireEvent.change(nameInput, { target: { value: 'Siddharth Roy' } });
    fireEvent.change(emailInput, { target: { value: 'siddharth@example.com' } });

    // Submit Step 1 to move to Step 2
    const continueToPayBtn = screen.getByRole('button', { name: /Continue to Sandbox Payment/i });
    await user.click(continueToPayBtn);

    // Step 2: Payment Simulator is active
    expect(screen.getByRole('heading', { name: /Sandbox Payment Gateway/i })).toBeInTheDocument();
    expect(screen.getByText(/Developer Test Environment:/i)).toBeInTheDocument();

    // Select Card simulator
    const cardOption = screen.getByRole('button', { name: /Test Card Simulator/i });
    await user.click(cardOption);

    // Click Simulate Payment button
    const simulatePayBtn = screen.getByRole('button', { name: /Simulate Payment/i });
    await user.click(simulatePayBtn);

    // Step 3: Wait for simulated gateway authorization to finish
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Simulated Order Confirmed!/i })).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(/siddharth@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Digital Deliverables:/i)).toBeInTheDocument();

    // Verify sample download button exists
    const downloadBtn = screen.getByRole('button', { name: /Download Sample/i });
    expect(downloadBtn).toBeInTheDocument();

    // Verify localStorage order history has been saved
    const savedOrders = SandboxCheckoutService.getOrderHistory();
    expect(savedOrders.length).toBe(1);
    expect(savedOrders[0].customer.fullName).toBe('Siddharth Roy');
  });

  it('renders CheckoutSimulatorModal standalone with rapid simulationDelayMs and downloads deliverables', async () => {
    let completed = false;

    render(
      <CheckoutSimulatorModal
        isOpen={true}
        onClose={() => {}}
        items={[{ product: productA, quantity: 1 }]}
        subtotalPaise={productA.pricePaise}
        simulationDelayMs={10}
        onOrderCompleted={() => {
          completed = true;
        }}
      />
    );

    // Step 1: Submit contact
    const continueBtn = screen.getByRole('button', { name: /Continue to Sandbox Payment/i });
    fireEvent.click(continueBtn);

    // Step 2: Simulate Payment
    const simulateBtn = screen.getByRole('button', { name: /Simulate Payment/i });
    fireEvent.click(simulateBtn);

    // Step 3: Wait for confirmation
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Simulated Order Confirmed!/i })).toBeInTheDocument();
    });

    expect(completed).toBe(true);

    // Click sample download button
    const downloadBtn = screen.getByRole('button', { name: /Download Sample/i });
    fireEvent.click(downloadBtn);
    expect(screen.getByText(/Downloaded/i)).toBeInTheDocument();
  });
});
