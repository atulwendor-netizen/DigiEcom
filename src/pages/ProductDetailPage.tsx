import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Shield,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';
import productsData from '../data/products.json';
import { Product } from '../types/product';
import { ProductCoverVisual } from '../components/products/ProductCoverVisual';
import { ProductCard } from '../components/products/ProductCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { formatINR } from '../utils/currency';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const products = productsData as unknown as Product[];
  const product = products.find((p) => p.slug === slug);

  useDocumentTitle(
    product ? product.name : 'Product Not Found',
    product ? product.shortDescription : 'The requested digital product could not be located.'
  );

  // Handle Invalid Product Slug (404 state)
  if (!product) {
    return (
      <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-20)' }}>
        <div className="container container-narrow" style={{ textAlign: 'center' }}>
          <div
            className="card"
            style={{
              padding: 'var(--space-12) var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Product Not Found</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px' }}>
              We could not find any digital product matching the URL slug{' '}
              <span className="code-inline">{slug}</span>. It may have been renamed or removed from the demonstration catalogue.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Link to="/products" className="btn btn-primary">
                <ArrowLeft size={16} />
                <span>Return to Catalogue</span>
              </Link>
              <Link to="/" className="btn btn-secondary">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Related products from the same category (excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container">
        {/* Navigation Breadcrumbs & Back Link */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Breadcrumbs
            items={[
              { label: 'Products', path: '/products' },
              { label: product.categoryLabel, path: `/products?category=${product.category}` },
              { label: product.name },
            ]}
          />
          <Link
            to="/products"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 'var(--text-xs)', gap: '4px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Catalogue</span>
          </Link>
        </div>

        {/* Top Product Hero (2 Columns) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)',
          }}
          className="product-detail-grid"
        >
          {/* Left Column: Cover & Gallery */}
          <div>
            <ProductCoverVisual product={product} size="lg" />

            {/* Gallery Previews / Inclusions visual tags */}
            {product.gallery.length > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Documented Inclusions & Schemas
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {product.gallery.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-card)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Layers size={13} color="var(--accent-lime)" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Title, Metadata, Pricing, Disabled Checkout Action */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
              <span className="badge badge-violet">{product.categoryLabel}</span>
              {product.isFeatured && (
                <span className="badge badge-lime">
                  <Sparkles size={11} /> Featured
                </span>
              )}
              <span className="badge badge-demo">Demonstration Item</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: 'var(--text-primary)',
              }}
            >
              {product.name}
            </h1>

            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {product.shortDescription}
            </p>

            {/* Price Card */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--accent-lime)',
                  }}
                >
                  {formatINR(product.pricePaise)}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  INR (One-time payment)
                </span>
              </div>

              {/* Honest Checkout Disabled Notification */}
              <div
                className="notice-banner notice-warning"
                style={{ fontSize: 'var(--text-xs)' }}
                role="status"
              >
                <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Checkout Disabled in Storefront Preview:</strong> Payment gateway integration and automated
                  file fulfillment remain disabled in this release. No card or UPI details are accepted.
                </div>
              </div>

              {/* Disabled Purchase Action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    opacity: 0.65,
                    cursor: 'not-allowed',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-card)',
                  }}
                >
                  <span>Checkout Coming Soon (Disabled)</span>
                </button>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
                  Transactions will be enabled once server-side payment verification and signed storage are active.
                </span>
              </div>
            </div>

            {/* Quick Specs Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-card)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>FORMATS</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {product.fileFormats.join(', ')}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>LICENSE</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                  {product.licenseType}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>DELIVERY</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                  {product.deliveryMethod}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block' }}>CATALOGUE DATE</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(product.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs / Sections */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-16)',
          }}
          className="product-specs-grid"
        >
          {/* Full Description & What's Included */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <div className="card">
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Comprehensive Overview
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {product.fullDescription}
              </p>
            </div>

            {/* What's Included */}
            <div className="card">
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                What&apos;s Included in This Package
              </h2>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {product.contents.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <CheckCircle2 size={18} color="var(--accent-lime)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Compatibility, License, and FAQs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {/* Compatibility & System Requirements */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <FileCode size={20} color="var(--accent-violet)" />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Compatibility & System Requirements</h3>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {product.compatibility}
              </p>
            </div>

            {/* License & Acceptable Use Restrictions */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Shield size={20} color="var(--accent-orange)" />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>License & Usage Restrictions</h3>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
                <strong>{product.licenseType}</strong>: Grants usage rights for internal projects and commercial software development.
                Resale, redistribution of raw source files, or public mirror hosting is strictly prohibited.
              </p>
              <Link
                to="/policies/license"
                style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-lime)', textDecoration: 'underline' }}
              >
                Read full acceptable use policy &rarr;
              </Link>
            </div>

            {/* Frequently Asked Questions Accordion */}
            {product.faqs && product.faqs.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <HelpCircle size={20} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Frequently Asked Questions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {product.faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        style={{
                          border: '1px solid var(--border-card)',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          aria-expanded={isOpen}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-surface-elevated)',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            size={16}
                            style={{
                              transform: isOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform var(--transition-fast)',
                            }}
                          />
                        </button>
                        {isOpen && (
                          <div
                            style={{
                              padding: 'var(--space-3) var(--space-4)',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                              background: 'var(--bg-surface)',
                              borderTop: '1px solid var(--border-card)',
                            }}
                          >
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ paddingTop: 'var(--space-12)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <span className="badge badge-violet" style={{ marginBottom: 'var(--space-2)' }}>
                Related Category Assets
              </span>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>More from {product.categoryLabel}</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-6)',
              }}
            >
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
