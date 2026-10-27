import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCoverVisual } from './ProductCoverVisual';
import { formatINR } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <article
      className="card card-interactive"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg-surface)',
      }}
    >
      {/* Product Cover Visual */}
      <Link
        to={`/products/${product.slug}`}
        aria-label={`View details for ${product.name}`}
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <ProductCoverVisual product={product} size="md" />
      </Link>

      {/* Card Content */}
      <div
        style={{
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          {/* Category Tag & Featured Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <span className="badge badge-violet" style={{ fontSize: '11px' }}>
              {product.categoryLabel}
            </span>
            {product.isFeatured && (
              <span className="badge badge-lime" style={{ fontSize: '11px' }}>
                <Sparkles size={10} />
                Featured
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: 'var(--space-2)',
              color: 'var(--text-primary)',
            }}
          >
            <Link
              to={`/products/${product.slug}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
            >
              {product.name}
            </Link>
          </h3>

          {/* Short Benefit-oriented Description */}
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.shortDescription}
          </p>
        </div>

        {/* Inclusions / Compatibility snippet */}
        <div
          style={{
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                display: 'block',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Price (INR)
            </span>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--accent-lime)',
              }}
            >
              {formatINR(product.pricePaise)}
            </div>
          </div>

          <Link
            to={`/products/${product.slug}`}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', padding: '0.4rem 0.75rem' }}
          >
            <span>View Details</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
};
