import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Cpu, Scale, HelpCircle, ArrowRight } from 'lucide-react';
import { RevealOnScroll } from '../common/RevealOnScroll';

export const TrustSection: React.FC = () => {
  const checklists = [
    {
      title: '1. File Formats & Extractors',
      icon: <FileCheck size={20} color="var(--accent-lime)" />,
      description:
        'Verify your workstation has software capable of opening the provided formats (e.g. .fig for Figma, .xlsx for Excel, .epub for e-readers, .blend for Blender).',
    },
    {
      title: '2. System Requirements & Versions',
      icon: <Cpu size={20} color="var(--accent-violet)" />,
      description:
        'Check minimum version numbers stated on the product page (e.g. Node.js version, Obsidian build, or Python runtime) to avoid runtime incompatibilities.',
    },
    {
      title: '3. Licensing & Commercial Rights',
      icon: <Scale size={20} color="var(--accent-orange)" />,
      description:
        'Read the license scope: single-user personal licenses differ from team commercial licenses and template redistribution rights.',
    },
    {
      title: '4. Refund & Cancellation Terms',
      icon: <HelpCircle size={20} color="var(--accent-pink)" />,
      description:
        'Understand standard digital good policies regarding intangible downloads and review our cancellation provisions prior to purchase.',
    },
  ];

  return (
    <section
      aria-labelledby="trust-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
        backgroundColor: 'rgba(16, 12, 36, 0.4)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        {/* Header */}
        <RevealOnScroll>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-12) auto' }}>
            <span className="badge badge-lime" style={{ marginBottom: 'var(--space-2)' }}>
              Honest Buyer Guidance
            </span>
            <h2
              id="trust-heading"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 'var(--space-3)',
              }}
            >
              What to Verify Before Purchasing Digital Assets
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              We believe in complete transparency. We don't display fake five-star reviews or artificial countdown timers.
              Here is what you should always check before purchasing digital software, templates, or media.
            </p>
          </div>
        </RevealOnScroll>

        {/* 4 Checklist Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-10)',
          }}
        >
          {checklists.map((item, idx) => (
            <RevealOnScroll key={idx} delay={idx * 60} style={{ height: '100%' }}>
              <div
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
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

                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Links to Policies */}
        <RevealOnScroll delay={200}>
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                Need Help or Have Pre-Purchase Questions?
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                Read our comprehensive policy documents or contact our developer support team directly.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <Link to="/policies/refunds" className="btn btn-secondary btn-sm">
                <span>Refund Policy</span>
                <ArrowRight size={12} />
              </Link>
              <Link to="/policies/delivery" className="btn btn-secondary btn-sm">
                <span>Delivery Policy</span>
                <ArrowRight size={12} />
              </Link>
              <Link to="/contact" className="btn btn-primary btn-sm">
                <span>Contact Support</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
