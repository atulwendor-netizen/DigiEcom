import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import { CheckoutDemoModal } from './CheckoutDemoModal';
import { CheckoutSimulatorModal } from './CheckoutSimulatorModal';
import { RazorpayCheckoutModal } from '../checkout/RazorpayCheckoutModal';
import { OrderConfirmationModal } from '../checkout/OrderConfirmationModal';
import type { VerifiedOrder } from '../../types/checkout';

export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotalPaise,
    subtotalFormatted,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<VerifiedOrder | null>(null);
  const navigate = useNavigate();

  // Close drawer on Escape key (if checkout modal or simulator is not open)
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !checkoutModalOpen && !simulatorOpen && !razorpayModalOpen && !confirmedOrder) {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, checkoutModalOpen, simulatorOpen, razorpayModalOpen, confirmedOrder, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="cart-drawer-backdrop"
        onClick={closeCart}
        role="presentation"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 8, 20, 0.72)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer */}
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--panel)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: '-10px 0 45px rgba(0, 0, 0, 0.55)',
          zIndex: 1101,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--ink-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShoppingBag size={20} color="var(--accent-lime)" />
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Your Cart
            </h2>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                background: 'var(--panel-light)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {items.length === 0 ? (
            /* Empty State */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 'var(--space-8) var(--space-4)',
                gap: 'var(--space-3)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(198, 255, 101, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-lime)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <ShoppingBag size={32} />
              </div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>Your cart is empty</h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  maxWidth: '300px',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Explore our curated digital assets, full-stack boilerplates, and developer resources.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  navigate('/products');
                }}
                className="btn btn-primary"
                style={{ marginTop: 'var(--space-3)' }}
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* Item List */
            items.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--ink-2)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                }}
              >
                {/* Visual Thumbnail Pill */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-sm)',
                    background: item.product.coverGradient || 'linear-gradient(135deg, #2b2548, #1c1830)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--accent-lime)',
                    }}
                  >
                    {item.product.fileFormats[0] || 'DIGI'}
                  </span>
                </div>

                {/* Info & Quantity */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <Link
                      to={`/products/${item.product.slug}`}
                      onClick={closeCart}
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        lineHeight: 1.3,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    >
                      {item.product.name}
                    </Link>

                    {/* Remove Item Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      aria-label={`Remove ${item.product.name} from cart`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.product.categoryLabel}
                  </span>

                  {/* Quantity Stepper & Price Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'var(--space-2)',
                    }}
                  >
                    {/* Stepper */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'var(--panel-light)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-card)',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>

                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          minWidth: '24px',
                          textAlign: 'center',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.product.name}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: 'var(--text-sm)',
                          color: 'var(--accent-lime)',
                        }}
                      >
                        {formatINR(item.product.pricePaise * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-dim)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {formatINR(item.product.pricePaise)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: 'var(--space-5)',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--ink-2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {/* Subtotal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                }}
              >
                {subtotalFormatted}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
              Taxes calculated at checkout &bull; Instant digital delivery via direct secure link
            </p>

            {/* Razorpay Instant Checkout CTA */}
            <button
              type="button"
              onClick={() => setRazorpayModalOpen(true)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                fontSize: 'var(--text-base)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-lime)',
                color: '#000',
                border: 'none',
                boxShadow: '0 4px 20px rgba(187, 242, 70, 0.25)',
              }}
            >
              <Lock size={16} />
              <span>Pay with Razorpay</span>
            </button>

            {/* Standard Proceed CTA */}
            <button
              type="button"
              onClick={() => setCheckoutModalOpen(true)}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </button>

            {/* Clear Cart link */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={clearCart}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                Empty Cart
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Honest Demo Checkout Modal */}
      <CheckoutDemoModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        itemCount={itemCount}
        subtotalPaise={subtotalPaise}
        onLaunchSimulator={() => setSimulatorOpen(true)}
        onLaunchRazorpay={() => setRazorpayModalOpen(true)}
      />

      {/* 3-Step Sandbox Checkout Simulator */}
      <CheckoutSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        items={items}
        subtotalPaise={subtotalPaise}
        onOrderCompleted={() => clearCart()}
      />

      {/* Active Razorpay Payment Gateway Modal */}
      <RazorpayCheckoutModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        items={items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          pricePaise: i.product.pricePaise,
        }))}
        subtotalPaise={subtotalPaise}
        onPaymentSuccess={(order) => {
          setConfirmedOrder(order);
          clearCart();
        }}
      />

      {/* Post-Payment Order Confirmation & Instant Fulfillment */}
      <OrderConfirmationModal
        isOpen={Boolean(confirmedOrder)}
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />
    </>
  );
};
