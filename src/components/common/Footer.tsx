import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowUpRight } from 'lucide-react';
import categoriesData from '../../data/categories.json';
import { siteConfig } from '../../config/siteConfig';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: '#070410',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'var(--space-20)',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-12)',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="container">
        {/* Top Notice: Demonstration Storefront */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px dashed rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-6)',
            marginBottom: 'var(--space-12)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fcd34d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={20} />
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ fontWeight: 700, color: '#fcd34d', fontSize: 'var(--text-sm)' }}>
              Storefront Preview & Architectural Demonstration
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
              DigiEcom is currently configured as a functional storefront preview. Sample products demonstrate
              catalogue structures, licensing frameworks, and metadata models. Payment integration and automated
              digital file downloads remain inactive until production release.
            </p>
          </div>
        </div>

        {/* 4-Column Footer Navigation */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)',
          }}
        >
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
              aria-label={`${siteConfig.brandName} Footer Home`}
            >
              <BrandLogo size="md" showTagline={false} />
            </Link>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Curated digital assets, system design handbooks, prompt vaults, and business models built for modern
              software founders, builders, and creative engineers.
            </p>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
              Currency Standard: <span className="code-inline">INR (₹)</span> | Integer Paise Architecture
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)',
              }}
            >
              Digital Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {categoriesData.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.id}`}
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Information */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)',
              }}
            >
              Company & Help
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li>
                <Link
                  to="/products"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  About DigiEcom
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Contact & Support
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Sitemap</span>
                  <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Policies (Required by Section 8 & 10) */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)',
              }}
            >
              Legal & Policies
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li>
                <Link
                  to="/policies/privacy"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/terms"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/refunds"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/delivery"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Digital Delivery Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policies/license"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  License & Usage Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-card)',
            paddingTop: 'var(--space-6)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            &copy; {currentYear} {siteConfig.copyrightHolder}. All rights reserved. Sample demonstration catalogue.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <span>No paid checkout active</span>
            <span>&bull;</span>
            <span>Zero trackers</span>
            <span>&bull;</span>
            <span>Client-side SPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
