import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RevealOnScroll } from '../common/RevealOnScroll';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: '1. Discover & Filter',
      badge: 'Active in Storefront',
      desc: 'Browse curated product categories and find resources matching your stack with verified file formats and system requirements.',
    },
    {
      num: '02',
      title: '2. Review Inclusions',
      badge: 'Active in Storefront',
      desc: 'Inspect exact file extensions, software compatibility, inclusions list, licensing scopes, and practical FAQs before deciding.',
    },
    {
      num: '03',
      title: '3. Purchase',
      badge: 'Temporarily Disabled',
      desc: 'Purchases and payment processing are temporarily disabled. Backend payment gateways with server-side signature verification will be added in a future release.',
    },
    {
      num: '04',
      title: '4. Instant Access',
      badge: 'Coming in Future Release',
      desc: 'Paid orders will receive authenticated, short-lived signed download links directly from private cloud storage with full receipt history.',
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-20)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="container">
        <div
          className="how-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '50px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: How Intro */}
          <div className="how-intro">
            <RevealOnScroll>
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
                Simple by design
              </div>
              <h2
                id="how-it-works-heading"
                style={{
                  margin: '0 0 16px',
                  fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                  letterSpacing: '-0.065em',
                  lineHeight: 1.05,
                  fontWeight: 900,
                  color: 'var(--text)',
                }}
              >
                How DigiEcom Works
              </h2>
              <p
                style={{
                  color: 'var(--muted)',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  maxWidth: '460px',
                  marginBottom: '24px',
                }}
              >
                DigiEcom is designed to make discovering digital resources straightforward. This preview demonstrates the intended customer journey; purchases and automated delivery remain inactive.
              </p>

              {/* Disabled Checkout Notice Callout */}
              <div
                className="notice-banner notice-warning"
                style={{ maxWidth: '460px', marginBottom: '24px' }}
              >
                <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Storefront Phase 1 Notice:</strong> Purchases and payment processing are temporarily disabled until backend payment webhooks and private signed storage are connected. No financial transactions or digital deliveries will occur in this preview.
                </div>
              </div>

              <a className="btn btn-primary" href="#products">
                Explore the preview <span aria-hidden="true">↗</span>
              </a>
            </RevealOnScroll>
          </div>

          {/* Right Column: Steps */}
          <div className="steps" style={{ display: 'grid', gap: '14px' }}>
            {steps.map((step, idx) => (
              <RevealOnScroll key={step.num} delay={idx * 80}>
                <article className="demo-step-card">
                  <div className="demo-step-num">{step.num}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          letterSpacing: '-0.03em',
                          color: 'var(--text)',
                        }}
                      >
                        {step.title}
                      </h3>
                      <span
                        className={`badge ${
                          step.badge.includes('Active') ? 'badge-lime' : 'badge-demo'
                        }`}
                        style={{ fontSize: '10px' }}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--muted)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
