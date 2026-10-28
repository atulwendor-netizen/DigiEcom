import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, CheckCircle2, Shield, Download, RotateCcw } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const Hero: React.FC = () => {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        position: 'relative',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-16)',
        overflow: 'visible',
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

      <div
        className="container hero-inner"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
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
                <span>THE DIGITAL RESOURCE MARKETPLACE</span>
              </div>
            </div>

            {/* Headline with Text-Rise Animation */}
            <h1
              id="hero-heading"
              aria-label="Your Next Big Idea Starts With the Right Digital Tools."
              className="hero-title"
              style={{
                margin: '18px 0 16px',
                fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
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
              className="hero-copy hero-text hero-stagger-3"
              style={{
                fontSize: '1.08rem',
                color: 'var(--muted)',
                lineHeight: 1.6,
                maxWidth: '680px',
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
                <span>Shop Bestsellers</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <a href="#category-explorer" className="btn btn-secondary btn-lg">
                Free Samples
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
              <span>Join 2,400+ builders</span>
            </div>

            {/* Trust Badges: Readable, 18px icons, with 2 new badges */}
            <div
              className="trust-badges"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-card)',
                fontSize: '0.9rem',
                color: '#d8d0f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="var(--lime)" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span>DRM-Free Open Formats</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="var(--lavender)" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span>Direct Transparent Pricing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="var(--orange)" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span>Tested by working engineers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} color="var(--lime)" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span>Instant Download</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color="var(--pink)" style={{ width: 18, height: 18, flexShrink: 0 }} />
                <span>7-Day Refund</span>
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
              overflow: 'visible',
            }}
          >
            <div
              className="hero-art hero-visual"
              aria-label="Decorative digital product mockups"
              style={{
                position: 'relative',
                minHeight: '460px',
                overflow: 'visible',
              }}
            >
              <div className="art-glow" />
              <div className="art-orbit" />
              <div
                className="product-mock mock-pink card-ebook"
                style={{ overflow: 'visible', zIndex: 1 }}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>E-Book</div>
                <h3 style={{ fontSize: '0.88rem', lineHeight: 1.15 }}>The Pragmatic System Design Handbook</h3>
                <p className="subtext" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.8rem' }}>340 pages &bull; Architecture</p>
                <div className="mini-lines"><span></span><span></span><span></span></div>
              </div>
              <div
                className="product-mock mock-main card-main"
                style={{ overflow: 'visible', zIndex: 3 }}
              >
                <span className="mock-label">DIGIECOM / STOREFRONT</span>
                <span className="tagline" style={{ color: '#fff' }}>IDEAS →{'\n'}INTO ACTION</span>
              </div>
              <div
                className="product-mock mock-orange card-prompts"
                style={{ overflow: 'visible', zIndex: 2 }}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>AI Prompts</div>
                <h3 style={{ fontSize: '0.88rem', lineHeight: 1.15 }}>Enterprise Prompt Vault: 450+ Tested System Prompts</h3>
                <p className="subtext" style={{ margin: '4px 0', opacity: 0.9, fontSize: '0.8rem' }}>450+ tested schemas</p>
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
