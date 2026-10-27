import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, CheckCircle2, Shield } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const Hero: React.FC = () => {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-16)',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Background layered ambient glow shapes from demo */}
      <div
        style={{
          position: 'absolute',
          top: '-90px',
          right: '-120px',
          width: '540px',
          height: '540px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(130, 83, 255, 0.2), transparent 68%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(2px)',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-70px',
          left: '-180px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198, 255, 101, 0.12), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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
            {/* Top Eyebrow */}
            <div className="hero-stagger-1" style={{ display: 'inline-flex' }}>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                <span>The digital resource marketplace &bull; Storefront preview</span>
              </div>
            </div>

            {/* Headline with Text-Rise Animation */}
            <h1
              id="hero-heading"
              aria-label="Your Next Big Idea Starts With the Right Digital Tools."
              style={{
                margin: '18px 0 16px',
                fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)',
                letterSpacing: '-0.065em',
                lineHeight: 1.02,
                fontWeight: 900,
              }}
            >
              <span className="hero-line">
                <span>Your Next Big Idea</span>
              </span>
              <span className="hero-line">
                <span>Starts With the Right</span>
              </span>
              <span className="hero-line">
                <span className="accent" style={{ color: 'var(--lime)' }}>Digital Tools.</span>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p
              className="hero-copy hero-stagger-3"
              style={{
                fontSize: '1.08rem',
                color: 'var(--muted)',
                lineHeight: 1.6,
                maxWidth: '560px',
              }}
            >
              {siteConfig.heroSubheadline}
            </p>

            {/* CTAs */}
            <div
              className="hero-actions hero-stagger-4"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <Link to="/products" className="btn btn-primary btn-lg">
                <span>Explore Products</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <a href="#category-explorer" className="btn btn-secondary btn-lg">
                Browse Categories
              </a>
            </div>

            {/* Hero Proof Dots */}
            <div
              className="hero-proof hero-stagger-5"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--muted)',
                fontSize: '0.85rem',
              }}
            >
              <span className="proof-dots" aria-hidden="true">
                <i></i><i></i><i></i>
              </span>
              <span>Find your next useful digital resource.</span>
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
                <CheckCircle2 size={16} color="var(--lime)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  DRM-Free Open Formats
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={16} color="var(--lavender)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Direct Transparent Pricing
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Terminal size={16} color="var(--orange)" />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                  Practitioner Tested
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Floating Product Mockups */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="hero-art" aria-label="Decorative digital product mockups">
              <div className="art-glow" />
              <div className="art-orbit" />
              <div className="product-mock mock-pink">
                <div style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>E-Book</div>
                <h3 style={{ fontSize: '0.88rem', lineHeight: 1.15 }}>The Pragmatic System Design Handbook</h3>
                <p style={{ fontSize: '0.64rem', margin: '4px 0', opacity: 0.8 }}>340 pages &bull; Architecture</p>
                <div className="mini-lines"><span></span><span></span><span></span></div>
              </div>
              <div className="product-mock mock-main">
                <span className="mock-label">DIGIECOM / STOREFRONT</span>
              </div>
              <div className="product-mock mock-orange">
                <div style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>AI Prompts</div>
                <h3 style={{ fontSize: '0.88rem', lineHeight: 1.15 }}>Enterprise Prompt Vault: 450+ Tested System Prompts</h3>
                <p style={{ fontSize: '0.64rem', margin: '4px 0', opacity: 0.8 }}>450+ tested schemas</p>
                <div className="mini-lines"><span></span><span></span><span></span></div>
              </div>
              <div className="art-sticker" aria-hidden="true">✳</div>
              <div className="art-caption">Tools for your next chapter</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
