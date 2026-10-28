import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCoverVisual } from './ProductCoverVisual';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { acquireScrollLock } from '../../utils/scrollLock';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addItem } = useCart();

  // Close on Escape key
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

  // Coordinated scroll-lock that preserves page position and handles unmounting cleanly
  useEffect(() => {
    if (!isOpen) return;

    const releaseLock = acquireScrollLock();
    return () => {
      releaseLock();
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;
  if (typeof document === 'undefined') return null;

  const handleAddToCart = () => {
    addItem(product);
    onClose();
  };

  const modalContent = (
    <div
      className="quickview-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 3vw, 24px)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        className="quickview-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="quickview-close-btn"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(23, 21, 38, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-full, 50%)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 30,
            transition: 'all var(--transition-fast, 0.18s ease)',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--lime)';
            e.currentTarget.style.backgroundColor = 'var(--panel-light, #302b4b)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            e.currentTarget.style.backgroundColor = 'rgba(23, 21, 38, 0.85)';
          }}
        >
          <X size={18} />
        </button>

        {/* Left Column: Visual Cover & Meta Tags */}
        <div className="quickview-left-col">
          <div>
            <ProductCoverVisual product={product} size="md" />

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-lime" style={{ fontSize: '11px' }}>
                {product.categoryLabel}
              </span>
              {product.isFeatured && (
                <span className="badge badge-violet" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} /> Featured
                </span>
              )}
              <span className="badge badge-demo" style={{ fontSize: '11px' }}>
                DEMO ASSET
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div
            style={{
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>Included Formats:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>
                {product.fileFormats.join(', ')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-dim)' }}>Compatibility:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: 1.4, minWidth: 0 }}>
                {product.compatibility}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>License:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-lime)', textAlign: 'right', overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>
                {product.licenseType}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Inclusions & Actions */}
        <div className="quickview-right-col">
          <div>
            <h2
              id="quickview-title"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: 'var(--space-2)',
                paddingRight: 'var(--space-8)',
              }}
            >
              {product.name}
            </h2>

            {/* Price Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  color: 'var(--accent-lime)',
                }}
              >
                {formatINR(product.pricePaise)}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                INR &bull; Instant Download Demo
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-4)',
              }}
            >
              {product.shortDescription}
            </p>

            {/* Inclusions / Contents List */}
            {product.contents.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Package Contents:
                </span>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {product.contents.slice(0, 4).map((content, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      <CheckCircle2 size={14} color="var(--accent-lime)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ minWidth: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{content}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  minWidth: '160px',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>

              <Link
                to={`/products/${product.slug}`}
                onClick={onClose}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <span>Full Details</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
              One-time payment &bull; Free lifetime updates &bull; No subscriptions
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
