import React from 'react';
import { Search, FileText, CreditCard, Download, AlertTriangle } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Discover Assets',
      icon: <Search size={22} color="var(--accent-lime)" />,
      badge: 'Active in Storefront',
      description:
        'Browse curated digital collections by category, keyword, or required file formats. Inspect live previews, inclusions, and metadata.',
    },
    {
      stepNumber: '02',
      title: 'Review Specifications',
      icon: <FileText size={22} color="var(--accent-violet)" />,
      badge: 'Active in Storefront',
      description:
        'Verify software compatibility, licensing constraints, file extensions, and FAQs before deciding if an asset fits your workflow.',
    },
    {
      stepNumber: '03',
      title: 'Secure Checkout',
      icon: <CreditCard size={22} color="var(--accent-orange)" />,
      badge: 'Coming in Future Release',
      description:
        'Once backend payment gateways are implemented and tested, purchases will be processed securely with server-side signature verification.',
    },
    {
      stepNumber: '04',
      title: 'Protected Delivery',
      icon: <Download size={22} color="var(--accent-cyan)" />,
      badge: 'Coming in Future Release',
      description:
        'Paid orders will receive authenticated, short-lived signed download links directly from private cloud storage with full receipt history.',
    },
  ];

  return (
    <section
      aria-labelledby="how-it-works-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-8) auto' }}>
          <span className="badge badge-violet" style={{ marginBottom: 'var(--space-2)' }}>
            Architecture & Roadmap
          </span>
          <h2
            id="how-it-works-heading"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-3)',
            }}
          >
            How DigiEcom Works
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Transparent overview of current storefront capabilities and upcoming infrastructure milestones.
          </p>
        </div>

        {/* Notice Callout */}
        <div
          className="notice-banner notice-warning"
          style={{ maxWidth: '820px', margin: '0 auto var(--space-10) auto' }}
        >
          <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Storefront Phase 1 Notice:</strong> Step 1 (Discovery) and Step 2 (Product Review) are fully
            operational today. Steps 3 and 4 (Checkout & Digital Fulfillment) remain intentionally disabled until
            backend payment webhooks and private signed storage are connected.
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'var(--space-6)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 800,
                      color: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {item.stepNumber}
                  </span>
                </div>

                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <span
                    className={`badge ${
                      item.badge.includes('Active') ? 'badge-lime' : 'badge-demo'
                    }`}
                    style={{ fontSize: '10px' }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    marginBottom: 'var(--space-2)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.title}
                </h3>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
