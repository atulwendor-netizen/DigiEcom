import React from 'react';
import { Target, Shield, Code, Cpu } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const AboutPage: React.FC = () => {
  useDocumentTitle(
    'About DigiEcom — Mission & Architecture',
    'Learn about DigiEcom, our curation methodology for digital assets, and our initial storefront release status.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'About DigiEcom' }]} />

        {/* Hero */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-lime" style={{ marginBottom: 'var(--space-2)' }}>
            About The Storefront
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Digital Tools Built for Builders
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            DigiEcom is a specialized digital-products storefront created to provide high-utility engineering
            playbooks, benchmarked AI prompt repositories, financial projection templates, and accessible design
            systems without inflated promises or opaque pricing.
          </p>
        </div>

        {/* Storefront Release Status Section */}
        <div
          id="storefront-status"
          className="card"
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-10)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Cpu size={22} color="var(--accent-lime)" />
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Storefront Architecture & Current Release</h2>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
            This release represents Phase 1: the public storefront, product taxonomy, and metadata discovery layer.
            In order to maintain strict engineering integrity:
          </p>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
            }}
          >
            <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent-lime)' }}>&bull;</span>
              <span>
                <strong>Payment Integration:</strong> Disabled until production gateway keys (Razorpay/Stripe) and server-side signed webhooks are deployed.
              </span>
            </li>
            <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent-lime)' }}>&bull;</span>
              <span>
                <strong>Automated Delivery:</strong> Digital asset files are kept completely out of public static folders to avoid accidental leakage. Signed, expiring storage links will be generated in Phase 2.
              </span>
            </li>
            <li style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--accent-lime)' }}>&bull;</span>
              <span>
                <strong>Product Records:</strong> All items in this catalogue are realistic demonstration items clearly badged as sample data.
              </span>
            </li>
          </ul>
        </div>

        {/* Guiding Principles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Our Core Principles</h2>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <Target size={20} color="var(--accent-violet)" />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>1. Practical Practitioner Utility</h3>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Every asset is designed to solve real tactical problems: system design latency calculations,
              few-shot prompt regression testing, or 5-year dynamic SaaS balance sheet modeling.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <Shield size={20} color="var(--accent-orange)" />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>2. Zero Hyperbolic Claims</h3>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We reject get-rich-quick claims and artificial urgency timers. We do not promise guaranteed income,
              10x developer speedups, or automated success. We provide clean, professional tools that respect your intelligence.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <Code size={20} color="var(--accent-lime)" />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>3. Open, Interoperable Standards</h3>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Where possible, digital products are formatted in open, standard structures: DRM-free PDF, EPUB, JSON,
              Markdown, W3C Design Tokens, and raw Excel/Word formats so you retain full ownership of your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
