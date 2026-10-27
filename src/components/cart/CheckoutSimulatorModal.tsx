import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  Download,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { CartItem } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import {
  SandboxCheckoutService,
  SandboxCustomerInfo,
  SandboxPaymentMethod,
  SandboxOrder,
} from '../../services/checkout/sandboxCheckout.service';

interface CheckoutSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotalPaise: number;
  onOrderCompleted: () => void;
  simulationDelayMs?: number;
}

type CheckoutStep = 'contact' | 'payment' | 'confirmation';

export const CheckoutSimulatorModal: React.FC<CheckoutSimulatorModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotalPaise,
  onOrderCompleted,
  simulationDelayMs = 600,
}) => {
  const [step, setStep] = useState<CheckoutStep>('contact');
  const [customer, setCustomer] = useState<SandboxCustomerInfo>({
    fullName: 'Jane Developer',
    email: 'developer@example.com',
    country: 'India',
    organization: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<SandboxPaymentMethod>('test_upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<SandboxOrder | null>(null);
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});

  // Reset simulator state when reopened
  useEffect(() => {
    if (isOpen) {
      setStep('contact');
      setIsProcessing(false);
      setCompletedOrder(null);
      setDownloadedItems({});
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.fullName.trim() || !customer.email.trim()) return;
    setStep('payment');
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const order = SandboxCheckoutService.createOrder(
        customer,
        items,
        subtotalPaise,
        paymentMethod
      );
      setCompletedOrder(order);
      setIsProcessing(false);
      setStep('confirmation');
      onOrderCompleted(); // Clears cart in CartContext
    }, simulationDelayMs);
  };

  const handleDownload = (productName: string, productId: string, formats: string[]) => {
    SandboxCheckoutService.triggerSimulatedDownload(productName, productId, formats);
    setDownloadedItems((prev) => ({ ...prev, [productId]: true }));
  };

  return (
    <div
      className="checkout-modal-backdrop"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
    >
      <div
        className="checkout-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-simulator-title"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
          position: 'relative',
          padding: 'var(--space-6)',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Close Button */}
        {!isProcessing && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout simulator"
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-full)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Step Progress Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: step === 'contact' ? 'var(--accent-lime)' : 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: step === 'contact' ? 'var(--accent-lime)' : 'var(--panel-light)',
                color: step === 'contact' ? 'var(--ink)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
            >
              1
            </span>
            <span>Contact</span>
          </div>

          <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>&bull;</span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: step === 'payment' ? 'var(--accent-lime)' : 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: step === 'payment' ? 'var(--accent-lime)' : 'var(--panel-light)',
                color: step === 'payment' ? 'var(--ink)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
            >
              2
            </span>
            <span>Sandbox Pay</span>
          </div>

          <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>&bull;</span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: step === 'confirmation' ? 'var(--accent-lime)' : 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: step === 'confirmation' ? 'var(--accent-lime)' : 'var(--panel-light)',
                color: step === 'confirmation' ? 'var(--ink)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
            >
              3
            </span>
            <span>Receipt</span>
          </div>
        </div>

        {/* ================= STEP 1: CONTACT DETAILS ================= */}
        {step === 'contact' && (
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <span className="badge badge-warning" style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Simulator Step 1
              </span>
              <h2 id="checkout-simulator-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
                Customer & Delivery Details
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Test contact inputs for digital fulfillment delivery. No real emails or SMS are dispatched.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <label htmlFor="customer-name" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div>
                <label htmlFor="customer-email" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
                  Delivery Email Address *
                </label>
                <input
                  id="customer-email"
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="input-field"
                  placeholder="e.g. alex@example.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label htmlFor="customer-country" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
                    Country / Region
                  </label>
                  <input
                    id="customer-country"
                    type="text"
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="customer-org" style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>
                    Organization (Optional)
                  </label>
                  <input
                    id="customer-org"
                    type="text"
                    value={customer.organization}
                    onChange={(e) => setCustomer({ ...customer, organization: e.target.value })}
                    className="input-field"
                    placeholder="Company or Studio"
                  />
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div
              style={{
                backgroundColor: 'var(--ink-2)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', display: 'block' }}>
                  {items.length} {items.length === 1 ? 'Product' : 'Products'} in Order
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Instant digital access &bull; DRM-free
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--accent-lime)' }}>
                {formatINR(subtotalPaise)}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: 'var(--space-3)' }}
            >
              <span>Continue to Sandbox Payment</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ================= STEP 2: SANDBOX PAYMENT ================= */}
        {step === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <span className="badge badge-warning" style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Simulator Step 2 &bull; Test Gateway
              </span>
              <h2 id="checkout-simulator-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
                Sandbox Payment Gateway
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Simulate a zero-cost test transaction. No real credit card, UPI, or bank data is collected.
              </p>
            </div>

            {/* Warning callout */}
            <div
              style={{
                backgroundColor: 'rgba(255, 189, 123, 0.09)',
                border: '1px solid rgba(255, 189, 123, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'flex-start',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}
            >
              <Info size={16} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Developer Test Environment:</strong> All mock payments are approved in local simulation.
                No card charge or UPI debit will occur.
              </div>
            </div>

            {/* Simulated Payment Methods */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {/* UPI Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('test_upi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: paymentMethod === 'test_upi' ? 'var(--panel-light)' : 'var(--ink-2)',
                  border: '1px solid',
                  borderColor: paymentMethod === 'test_upi' ? 'var(--accent-lime)' : 'var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Smartphone size={20} color={paymentMethod === 'test_upi' ? 'var(--accent-lime)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Instant UPI Simulator</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Pre-filled test handle: tester@okhdfcbank</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-lime)', fontWeight: 700 }}>
                  {paymentMethod === 'test_upi' ? 'Selected' : ''}
                </span>
              </button>

              {/* Card Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('test_card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: paymentMethod === 'test_card' ? 'var(--panel-light)' : 'var(--ink-2)',
                  border: '1px solid',
                  borderColor: paymentMethod === 'test_card' ? 'var(--accent-lime)' : 'var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <CreditCard size={20} color={paymentMethod === 'test_card' ? 'var(--accent-lime)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Test Card Simulator</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242 (Exp 12/28)</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-lime)', fontWeight: 700 }}>
                  {paymentMethod === 'test_card' ? 'Selected' : ''}
                </span>
              </button>

              {/* NetBanking Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('test_netbanking')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: paymentMethod === 'test_netbanking' ? 'var(--panel-light)' : 'var(--ink-2)',
                  border: '1px solid',
                  borderColor: paymentMethod === 'test_netbanking' ? 'var(--accent-lime)' : 'var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Building2 size={20} color={paymentMethod === 'test_netbanking' ? 'var(--accent-lime)' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>NetBanking Sandbox</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>HDFC / SBI / ICICI Test Bank</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-lime)', fontWeight: 700 }}>
                  {paymentMethod === 'test_netbanking' ? 'Selected' : ''}
                </span>
              </button>
            </div>

            {/* Total Amount Confirmation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Simulated Amount Due:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--accent-lime)' }}>
                {formatINR(subtotalPaise)}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => setStep('contact')}
                disabled={isProcessing}
                className="btn btn-secondary"
                style={{ gap: '6px' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authorizing Simulator...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Simulate Payment ({formatINR(subtotalPaise)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ORDER CONFIRMATION & RECEIPT ================= */}
        {step === 'confirmation' && completedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(198, 255, 101, 0.14)',
                  color: 'var(--accent-lime)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h2 id="checkout-simulator-title" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '0 0 4px' }}>
                Simulated Order Confirmed!
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--accent-lime)', fontWeight: 700 }}>
                Order #{completedOrder.id}
              </span>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '6px 0 0' }}>
                Simulated receipt recorded for <strong>{completedOrder.customer.email}</strong>.
              </p>
            </div>

            {/* Purchased Items & Simulated Deliverables */}
            <div
              style={{
                backgroundColor: 'var(--ink-2)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                Available Digital Deliverables:
              </span>

              {completedOrder.items.map((item) => {
                const isDownloaded = downloadedItems[item.product.id];
                return (
                  <div
                    key={item.product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-2) 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.product.fileFormats.join(' &bull; ')} &bull; {formatINR(item.product.pricePaise * item.quantity)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(item.product.name, item.product.id, item.product.fileFormats)}
                      className={`btn btn-sm ${isDownloaded ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
                    >
                      {isDownloaded ? <CheckCircle2 size={13} color="var(--accent-lime)" /> : <Download size={13} />}
                      <span>{isDownloaded ? 'Downloaded' : 'Download Sample'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Reassurance Note */}
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
              This was an in-browser sandbox test. In production, downloads are fulfilled via cryptographically signed
              one-time URLs generated upon gateway webhook confirmation.
            </div>

            {/* Return action */}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              <ShoppingBag size={16} />
              <span>Continue Exploring Storefront</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
