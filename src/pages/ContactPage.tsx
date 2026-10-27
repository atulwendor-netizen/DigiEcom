import React, { useState } from 'react';
import { Mail, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ContactPage: React.FC = () => {
  useDocumentTitle(
    'Contact & Support — DigiEcom',
    'Get in touch with the DigiEcom team for pre-purchase questions, licensing inquiries, and technical feedback.'
  );

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Pre-purchase inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Honest handling: acknowledges demo status without silently losing user expectation
    setFormSubmitted(true);
  };

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Contact & Support' }]} />

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-lime" style={{ marginBottom: 'var(--space-2)' }}>
            Support & Communications
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-3)',
            }}
          >
            Contact DigiEcom Support
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
            Have questions about digital asset compatibility, commercial team licensing, or custom requirements?
            Reach out through our direct support channels.
          </p>
        </div>

        {/* Support Metadata Box with clear placeholders */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-10)',
          }}
        >
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Mail size={18} color="var(--accent-lime)" />
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Direct Email Support</h3>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
              Primary Desk:{' '}
              <span className="code-inline">[support@yourdomain.com]</span>
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginTop: '4px' }}>
              Standard response within 24 business hours.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Clock size={18} color="var(--accent-violet)" />
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Operating Hours</h3>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
              Monday &ndash; Friday, 10:00 AM &ndash; 6:00 PM{' '}
              <span className="code-inline">[IST / UTC+5:30]</span>
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginTop: '4px' }}>
              Excludes gazetted national holidays.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Send Us a Message
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
            Fill out the form below. In this storefront preview release, your input will trigger an honest confirmation
            modal clarifying that email delivery requires mail server credentials.
          </p>

          {formSubmitted ? (
            <div
              className="card"
              style={{
                background: 'rgba(16, 239, 138, 0.1)',
                border: '1px solid var(--accent-lime)',
                textAlign: 'center',
                padding: 'var(--space-8)',
              }}
            >
              <CheckCircle2 size={36} color="var(--accent-lime)" style={{ margin: '0 auto var(--space-3) auto' }} />
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Message Preview Recorded
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
                Thank you for testing the contact form! Because this is a static storefront demonstration, no external
                email daemon has been triggered. In production, this form will forward directly to{' '}
                <span className="code-inline">[support@yourdomain.com]</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'Pre-purchase inquiry', message: '' });
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 'var(--space-4)' }}
              >
                Reset Contact Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label
                  htmlFor="contact-name"
                  style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-1)' }}
                >
                  Your Name <span style={{ color: 'var(--accent-lime)' }}>*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya Sharma"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-1)' }}
                >
                  Work or Personal Email <span style={{ color: 'var(--accent-lime)' }}>*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-1)' }}
                >
                  Inquiry Topic
                </label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field select-field"
                >
                  <option value="Pre-purchase inquiry">Pre-purchase question (formats, software versions)</option>
                  <option value="Licensing query">Commercial or multi-user licensing request</option>
                  <option value="Storefront feedback">Storefront preview feedback / bug report</option>
                  <option value="Other">Other general inquiry</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 'var(--space-1)' }}
                >
                  Message <span style={{ color: 'var(--accent-lime)' }}>*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question or requirements in detail..."
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                <MessageSquare size={16} />
                <span>Submit Inquiry (Preview)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
