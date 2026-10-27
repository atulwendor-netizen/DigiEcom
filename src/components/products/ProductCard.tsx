import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCoverVisual } from './ProductCoverVisual';
import { formatINR } from '../../utils/currency';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  return (
    <article
      className="card card-interactive product-card"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
        style={{ display: 'block', textDecoration: 'none' }}
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
          flex: 1,
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          {/* Metadata Row */}
          <div
            className="product-meta"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--muted)',
              fontSize: '0.74rem',
              marginBottom: '10px',
            }}
          >
            <span
              className="product-tag"
              style={{
                color: 'var(--lime)',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {product.categoryLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {product.fileFormats.slice(0, 2).join(' · ')} &bull; DEMO
            </span>
          </div>

          {/* Product Title */}
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.25,
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

          {/* Short Benefit-oriented Description */}
          <p
            style={{
              color: 'var(--muted)',
              margin: 0,
              fontSize: '0.86rem',
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

        {/* Product Bottom Row matching demo */}
        <div
          className="product-bottom"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--line)',
          }}
        >
          <div className="price">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: 'var(--text)',
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
              }}
            >
              Preview only &bull; Not for sale
            </small>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => addItem(product)}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={14} />
              <span>Add</span>
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="round-link"
              aria-label={`View details for ${product.name}`}
            >
              <span aria-hidden="true" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
