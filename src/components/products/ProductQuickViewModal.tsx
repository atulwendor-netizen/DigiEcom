import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCoverVisual } from './ProductCoverVisual';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';

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

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem(product);
    onClose();
  };

  return (
    <div
      className="quickview-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 8, 20, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
    >
      <div
        className="quickview-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
        style={{
          width: '100%',
          maxWidth: '820px',
          background: 'var(--panel)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.55)',
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          maxHeight: '90vh',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--panel-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
          }}
        >
          <X size={18} />
        </button>

        {/* Left Column: Visual Cover & Meta Tags */}
        <div
          style={{
            background: 'var(--ink-2)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Included Formats:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {product.fileFormats.join(', ')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>Compatibility:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {product.compatibility}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>License:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-lime)' }}>
                {product.licenseType}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Inclusions & Actions */}
        <div
          style={{
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
            maxHeight: '90vh',
          }}
        >
          <div>
            <h2
              id="quickview-title"
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: 'var(--space-2)',
                paddingRight: 'var(--space-6)',
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
                      <span>{content}</span>
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
};
