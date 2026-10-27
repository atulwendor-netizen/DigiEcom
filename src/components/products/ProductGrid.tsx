import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { AlertCircle } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onResetFilters?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onResetFilters,
  emptyTitle = 'No digital products match your criteria',
  emptyDescription = 'Try adjusting your search terms or selecting a different category filter.',
}) => {
  if (products.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-6)',
          margin: 'var(--space-6) 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-orange-subtle)',
            color: 'var(--accent-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
            {emptyTitle}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
            {emptyDescription}
          </p>
        </div>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn btn-outline btn-sm"
            style={{ marginTop: 'var(--space-2)' }}
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="product-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-6)',
      }}
    >
      {products.map((product, idx) => (
        <div
          key={product.id}
          className="product-grid-item"
          style={{
            animation: `fadeInUp var(--duration-base) var(--ease-out-smooth) ${Math.min(idx * 35, 200)}ms both`,
            height: '100%',
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};
