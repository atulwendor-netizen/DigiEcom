import React, { useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, ArrowRight, Play } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface CheckoutDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
  subtotalPaise: number;
  onLaunchSimulator?: () => void;
}

export const CheckoutDemoModal: React.FC<CheckoutDemoModalProps> = ({
  isOpen,
  onClose,
  itemCount,
  subtotalPaise,
  onLaunchSimulator,
}) => {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="checkout-modal-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="checkout-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-checkout-title"
        aria-describedby="demo-checkout-desc"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-6)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout preview dialog"
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
            transition: 'color var(--transition-fast), background var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--panel-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
          }}
        >
          <X size={18} />
        </button>

        {/* Badge & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
          <span
            className="badge badge-warning"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <AlertTriangle size={12} color="#f59e0b" />
            Storefront Preview
          </span>
        </div>

        <h2
          id="demo-checkout-title"
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            marginBottom: 'var(--space-3)',
            color: 'var(--text-primary)',
            lineHeight: 1.25,
          }}
        >
          Checkout Disabled in Demo
        </h2>

        {/* Honest Explanation */}
        <div id="demo-checkout-desc" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            DigiEcom is currently running in a demonstration preview release. Real payment processing
            (UPI, credit/debit cards, NetBanking) and automated file delivery are intentionally disabled
            until backend services and secure signed URLs are connected.
          </p>

          <div
            style={{
              background: 'rgba(255, 189, 123, 0.08)',
              border: '1px solid rgba(255, 189, 123, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Items in Cart:</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Subtotal:</span>
              <span
                style={{
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--accent-lime)',
                }}
              >
                {formatINR(subtotalPaise)}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-dim)',
            }}
          >
            <ShieldCheck size={16} color="var(--accent-lime)" style={{ flexShrink: 0 }} />
            <span>
              No payment credentials or card details are requested or recorded. Your selected products will remain saved
              in your browser's local storage.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-6)',
          }}
        >
          {onLaunchSimulator && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchSimulator();
              }}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
            >
              <Play size={16} />
              <span>Launch 3-Step Sandbox Checkout Simulator</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className={onLaunchSimulator ? 'btn btn-secondary' : 'btn btn-primary'}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span>Got it, Return to Store</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
