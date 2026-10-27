import React from 'react';
import { BellOff, Info } from 'lucide-react';
import { RevealOnScroll } from '../common/RevealOnScroll';

export const NewsletterSection: React.FC = () => {
  return (
    <section
      aria-labelledby="newsletter-heading"
      style={{
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-20)',
      }}
    >
      <div className="container">
        <RevealOnScroll>
          <div className="demo-final-cta">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '36px',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Left Column: Demo Headline */}
              <div>
                <div
                  style={{
                    color: 'rgba(23, 21, 38, 0.75)',
                    fontSize: '0.74rem',
                    fontWeight: 850,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Your next chapter starts here
                </div>
                <h2
                  id="newsletter-heading"
                  style={{
                    margin: '0 0 14px',
                    fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.06em',
                    fontWeight: 900,
                    color: 'var(--ink)',
                  }}
                >
                  Make room for your<br />next big idea.
                </h2>
                <p
                  style={{
                    color: 'rgba(23, 21, 38, 0.8)',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    maxWidth: '480px',
                    margin: 0,
                  }}
                >
                  Explore the demo storefront and imagine the resources you’ll bring to your own digital shop.
                </p>

                <div style={{ marginTop: '24px' }}>
                  <a
                    href="#home"
                    className="btn"
                    style={{
                      background: 'var(--ink)',
                      color: 'var(--text)',
                      borderRadius: '999px',
                      padding: '12px 24px',
                      fontWeight: 800,
                    }}
                  >
                    Back to top ↑
                  </a>
                </div>
              </div>

              {/* Right Column: Clearly Labeled Disabled Integration Placeholder */}
              <div
                style={{
                  background: 'rgba(23, 21, 38, 0.94)',
                  padding: '28px',
                  borderRadius: '22px',
                  color: 'var(--text)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span
                    className="badge badge-demo"
                    style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--lime)' }}
                  >
                    <BellOff size={12} />
                    Integration Inactive
                  </span>
                </div>

                <h3
                  style={{
                    margin: '0 0 8px',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: 'var(--text)',
                  }}
                >
                  Engineering Dispatch & Updates
                </h3>

                <p
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--muted)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                  }}
                >
                  Signup form is locked until production double opt-in ESP delivery is connected, ensuring zero silently dropped data.
                </p>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  aria-label="Newsletter subscription placeholder (disabled)"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                >
                  <input
                    type="email"
                    disabled
                    placeholder="subscriber@example.com"
                    aria-label="Email address (integration currently disabled)"
                    className="input-field"
                    style={{
                      flex: '1 1 200px',
                      cursor: 'not-allowed',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      padding: '10px 14px',
                      borderRadius: '999px',
                    }}
                  />
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="btn btn-secondary"
                    style={{
                      cursor: 'not-allowed',
                      opacity: 0.6,
                      borderRadius: '999px',
                      padding: '10px 18px',
                    }}
                  >
                    Notify Me (Inactive)
                  </button>
                </form>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '12px',
                    fontSize: '0.72rem',
                    color: 'var(--muted)',
                  }}
                >
                  <Info size={13} color="var(--lime)" />
                  <span>Zero unsolicited spam &bull; Demo placeholder.</span>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
