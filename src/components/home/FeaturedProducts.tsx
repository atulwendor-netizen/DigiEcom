import React from 'react';
import { Link } from 'react-router-dom';
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
        paddingBottom: 'var(--space-20)',
        backgroundColor: '#1d1a30',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
              gap: '24px',
              marginBottom: '36px',
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--lime)',
                  fontSize: '0.74rem',
                  fontWeight: 850,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Curated for curious minds &bull; Featured Catalogue
              </div>
              <h2
                id="featured-heading"
                style={{
                  margin: 0,
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                  letterSpacing: '-0.065em',
                  lineHeight: 1.04,
                  fontWeight: 900,
                  color: 'var(--text)',
                }}
              >
                Hand-Crafted Digital Solutions
              </h2>
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '1rem',
                  color: 'var(--muted)',
                  maxWidth: '580px',
                  lineHeight: 1.6,
                }}
              >
                A preview of curated digital products built for builders and creators. All items are demonstration records; purchases are currently disabled.
              </p>
            </div>

            <Link
              to="/products"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start' }}
            >
              <span>View All {products.length} Products</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </RevealOnScroll>

        {/* Featured Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
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
