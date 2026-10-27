import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCard } from '../products/ProductCard';
import { RevealOnScroll } from '../common/RevealOnScroll';

interface FeaturedProductsProps {
  products: Product[];
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  const featured = products.filter((p) => p.isFeatured);

  return (
    <section
      aria-labelledby="featured-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <RevealOnScroll>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-10)',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', marginBottom: 'var(--space-2)' }}>
                <span className="badge badge-lime">
                  <Sparkles size={12} />
                  <span>Featured Catalogue</span>
                </span>
              </div>
              <h2
                id="featured-heading"
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Hand-Crafted Digital Solutions
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '580px' }}>
                Selected digital resources featuring full documentation, verified system requirements, and clear licensing scopes.
                All items are sample demonstration records.
              </p>
            </div>

            <Link to="/products" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span>View All {products.length} Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </RevealOnScroll>

        {/* Featured Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {featured.map((product, idx) => (
            <RevealOnScroll key={product.id} delay={idx * 70} style={{ height: '100%' }}>
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
