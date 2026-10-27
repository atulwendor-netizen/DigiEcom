import React from 'react';
import { Mail, BellOff, Info } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  return (
    <section
      aria-labelledby="newsletter-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
      }}
    >
      <div className="container">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #130c2c 0%, #1a103d 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-10) var(--space-8)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid var(--accent-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-violet)',
              }}
            >
              <Mail size={24} />
            </div>

            <span className="badge badge-demo" style={{ fontSize: '11px' }}>
              <BellOff size={12} />
              Integration Inactive
            </span>

            <h2
              id="newsletter-heading"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Future Updates & Engineering Dispatch
            </h2>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We plan to share deep-dive architectural tear-downs, newly released prompt schemas, and open-source
              developer templates. In keeping with our zero-silent-discard policy, the newsletter signup form is
              currently locked until a production ESP (Email Service Provider) with double opt-in is configured.
            </p>

            {/* Clearly labeled disabled form placeholder */}
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                marginTop: 'var(--space-2)',
              }}
            >
              <form
                onSubmit={(e) => e.preventDefault()}
                aria-label="Newsletter subscription placeholder (disabled)"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  opacity: 0.75,
                }}
              >
                <input
                  type="email"
                  disabled
                  placeholder="subscriber@example.com"
                  aria-label="Email address (integration currently disabled)"
                  className="input-field"
                  style={{
                    flex: '1 1 240px',
                    cursor: 'not-allowed',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="btn btn-secondary"
                  style={{ cursor: 'not-allowed', opacity: 0.6 }}
                >
                  Notify Me (Inactive)
                </button>
              </form>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <Info size={13} color="var(--accent-lime)" />
                <span>Zero unsolicited spam. Form submission is disabled to prevent silently dropping data.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
