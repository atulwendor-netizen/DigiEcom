import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { VerifiedOrder } from '../../types/checkout';
import { formatINR } from '../../utils/currency';

interface OrderConfirmationModalProps {
  order: VerifiedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleCopy = (licenseKey: string) => {
    navigator.clipboard?.writeText(licenseKey);
    setCopiedKey(licenseKey);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="order-confirmation-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
    >
      <div
        className="order-confirmation-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-title"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid rgba(187, 242, 70, 0.3)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-6)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), 0 0 40px rgba(187, 242, 70, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close order confirmation"
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
          <X size={18} />
        </button>

        {/* Header with Success Animation Badge */}
        <div style={{ textAlign: 'center', paddingBottom: 'var(--space-2)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(187, 242, 70, 0.15)',
              border: '2px solid var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-3) auto',
            }}
          >
            <CheckCircle2 size={36} color="var(--accent-lime)" />
          </div>

          <span
            className="badge badge-success"
            style={{
              marginBottom: 'var(--space-2)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Payment Verified &bull; Instant Delivery
          </span>

          <h2
            id="order-success-title"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 'var(--space-1) 0',
            }}
          >
            Order Confirmed!
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            Thank you for purchasing from DigiEcom. Your digital deliverables are ready below.
          </p>
        </div>

        {/* Order Meta Card */}
        <div
          style={{
            backgroundColor: 'var(--ink-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Order ID
            </div>
            <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {order.id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Payment ID
            </div>
            <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-lime)' }}>
              {order.paymentId}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Total Paid
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-lime)' }}>
              {formatINR(order.amountPaise)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Recipient
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {order.customer.email}
            </div>
          </div>
        </div>

        {/* Digital Deliverables List */}
        <div>
          <h3
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={16} color="var(--accent-lime)" />
            Your Digital Downloads ({order.deliverables.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {order.deliverables.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div>
                    <h4
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {item.productName}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Format: {item.fileFormat} &bull; Size: {item.fileSize}
                    </span>
                  </div>

                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      padding: '6px 14px',
                      fontSize: 'var(--text-xs)',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>
                </div>

                {/* License Key Box */}
                <div
                  style={{
                    backgroundColor: 'var(--panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Commercial License Key
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.licenseKey}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.licenseKey)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedKey === item.licenseKey ? 'var(--accent-lime)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {copiedKey === item.licenseKey ? (
                      <>
                        <Check size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Delivery Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-dim)',
            paddingTop: 'var(--space-2)',
          }}
        >
          <ShieldCheck size={16} color="var(--accent-lime)" style={{ flexShrink: 0 }} />
          <span>
            Verified by Razorpay Payment Gateway. Digital access links remain valid for 30 days. Need assistance? Contact support@digiecom.demo.
          </span>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-card)',
          }}
        >
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}
          >
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', gap: '8px', fontSize: 'var(--text-xs)' }}
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
