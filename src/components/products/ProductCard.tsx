import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle2, Cpu } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCoverVisual } from './ProductCoverVisual';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { ProductQuickViewModal } from './ProductQuickViewModal';

interface ProductCardProps {
  product: Product;
}

const sanitizeDigits = (text: string) => text.replace(/0(\d)/g, '0\u200B$1');

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <article
      className="card card-interactive product-card"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        background: '#26223e',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: 'var(--radius)',
        transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Product Cover Visual */}
      <Link
        to={`/products/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        style={{ display: 'block', textDecoration: 'none', width: '100%', flexShrink: 0, minWidth: 0 }}
      >
        <ProductCoverVisual product={product} size="md" />
      </Link>

      {/* Card Content */}
      <div
        className="product-info"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minWidth: 0,
          boxSizing: 'border-box',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto', minWidth: 0, gap: '8px' }}>
          {/* Metadata Row */}
          <div
            className="product-meta"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              color: 'var(--muted)',
              fontSize: '0.74rem',
              minWidth: 0,
            }}
          >
            <span
              className="product-tag"
              style={{
                color: 'var(--lime)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {product.categoryLabel}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--muted)',
                minWidth: 0,
                wordBreak: 'break-word',
              }}
            >
              {product.fileFormats.slice(0, 2).join(' · ')} &bull; DEMO
            </span>
          </div>

          {/* Product Title */}
          <h3
            style={{
              margin: '2px 0 0',
              fontSize: '1.18rem',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.3,
              minWidth: 0,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            <Link
              to={`/products/${product.slug}`}
              style={{ textDecoration: 'none', color: 'var(--text)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--lime)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
            >
              {product.name}
            </Link>
          </h3>

          {/* Benefit-oriented Description - without truncation */}
          <p
            style={{
              color: 'var(--muted)',
              margin: '2px 0 0',
              fontSize: '0.86rem',
              lineHeight: 1.55,
              minWidth: 0,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            {product.shortDescription}
          </p>

          {/* Inclusions & Compatibility Badges (Unclipped, structured details) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm, 8px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.75rem',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0 }}>
              <CheckCircle2 size={13} style={{ color: 'var(--lime)', marginTop: '2px', flexShrink: 0 }} />
              <span
                style={{
                  color: 'var(--muted)',
                  minWidth: 0,
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Includes:</strong>{' '}
                {sanitizeDigits(
                  product.contents && product.contents.length > 0
                    ? product.contents[0]
                    : `${product.fileFormats.join(', ')} digital files`
                )}
              </span>
            </div>
            {product.compatibility && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0 }}>
                <Cpu size={13} style={{ color: 'var(--lavender, #c7bdff)', marginTop: '2px', flexShrink: 0 }} />
                <span
                  style={{
                    color: 'var(--muted)',
                    minWidth: 0,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Works with:</strong>{' '}
                  {sanitizeDigits(product.compatibility)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Bottom Row - aligned consistently via marginTop: auto */}
        <div
          className="product-bottom"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <div className="price" style={{ minWidth: 0, flex: '1 1 auto' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: 'var(--text)',
                display: 'block',
              }}
            >
              {formatINR(product.pricePaise)}
            </span>
            <small
              style={{
                display: 'block',
                color: 'var(--muted)',
                fontSize: '0.64rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              Preview only &bull; Not for sale
            </small>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              flexShrink: 0,
              maxWidth: '100%',
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="btn btn-ghost btn-sm"
              style={{
                padding: '6px 8px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-card)',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              aria-label={`Quick view ${product.name}`}
              title={`Quick view ${product.name}`}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => addItem(product)}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '6px 10px',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={13} />
              <span>Add</span>
            </button>

            <Link
              to={`/products/${product.slug}`}
              className="round-link"
              aria-label={`View details for ${product.name}`}
              style={{
                width: '38px',
                height: '38px',
                flexShrink: 0,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </article>
  );
};
