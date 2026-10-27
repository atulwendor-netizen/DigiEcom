import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Terminal, FileCode, CheckCircle2, Shield } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-16)',
        overflow: 'hidden',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-12)',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Headlines & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Top Badge */}
            <div style={{ display: 'inline-flex' }}>
              <span className="badge badge-lime" style={{ padding: '0.35rem 0.85rem' }}>
                <Sparkles size={12} />
                <span>Storefront Preview &bull; Curated Creator & Developer Assets</span>
              </span>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              Your Next Big Idea Starts With the{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #10ef8a 0%, #38bdf8 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Right Digital Tools.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '620px',
              }}
            >
              Discover rigorously structured system design handbooks, benchmarked AI prompt vaults,
              financial spreadsheets, Figma component libraries, and ergonomic developer dotfiles.
              Crafted to accelerate modern builders, engineers, and digital operators.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
                alignItems: 'center',
              }}
            >
              <Link to="/products" className="btn btn-primary btn-lg">
                <span>Explore Products</span>
                <ArrowRight size={18} />
              </Link>
              <a href="#category-explorer" className="btn btn-secondary btn-lg">
                Browse Categories
              </a>
            </div>

            {/* Honest Highlights / Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <CheckCircle2 size={16} color="var(--accent-lime)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  DRM-Free Open Formats
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={16} color="var(--accent-violet)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Direct Transparent Pricing
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Terminal size={16} color="var(--accent-orange)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Practitioner Tested
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Original CSS/SVG Digital Product Showcase Collage */}
          <div
            className="hero-collage"
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            {/* Primary Collage Card: Cloud Microservices Playbook */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #160d33 0%, #20134d 100%)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: 'var(--shadow-lg), var(--shadow-glow-violet)',
                transform: 'rotate(-1.5deg)',
                position: 'relative',
                zIndex: 3,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-lime">E-books & Guides</span>
                <span className="badge badge-demo">Sample Asset</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <FileCode size={24} color="var(--accent-lime)" />
                <h3 style={{ fontSize: 'var(--text-base)', color: '#ffffff' }}>
                  The Pragmatic System Design Handbook
                </h3>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                Distributed transactions, caching invalidation, latency SLAs &bull; 340 pages
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', fontWeight: 700 }}>
                  ₹799
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  .pdf &bull; .epub
                </span>
              </div>
            </div>

            {/* Overlapping Secondary Card: AI Prompt Vault */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #0d2820 0%, #153e32 100%)',
                border: '1px solid rgba(16, 239, 138, 0.3)',
                boxShadow: 'var(--shadow-md)',
                transform: 'rotate(2deg) translateY(-10px)',
                marginLeft: 'auto',
                maxWidth: '90%',
                zIndex: 2,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span className="badge badge-violet">AI Prompts</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-lime)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                  ₹999
                </span>
              </div>
              <h4 style={{ fontSize: 'var(--text-sm)', color: '#ffffff', marginBottom: 'var(--space-1)' }}>
                Enterprise Prompt Vault: 450+ Tested System Prompts
              </h4>
              <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Conditioned few-shot schemas formatted in .json, .md, and .csv
              </p>
            </div>

            {/* Overlapping Tertiary Card: Figma Design System */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #2b0c20 0%, #431235 100%)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                boxShadow: 'var(--shadow-sm)',
                transform: 'rotate(-1deg) translateY(-20px)',
                width: '85%',
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-pink" style={{ marginBottom: '4px' }}>Design Kit</span>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#ffffff' }}>
                    Lumina UI: 1,200+ Components
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#f472b6', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                  ₹1,999
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
