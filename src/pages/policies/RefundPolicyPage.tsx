import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarterPolicyDisclaimer } from '../../components/common/StarterPolicyDisclaimer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Mail, AlertCircle, FileText } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  useDocumentTitle(
    'Refund and Cancellation Policy — DigiEcom',
    'DigiEcom draft refund and cancellation policy for demonstration storefront and digital products.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Legal Policies', path: '/about' }, { label: 'Refund & Cancellation Policy' }]} />

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span className="badge badge-violet">
              Status: Draft — Demonstration Storefront Only
            </span>
            <span className="badge badge-demo" style={{ fontSize: '11px' }}>
              Store: DigiEcom
            </span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Refund and Cancellation Policy
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Version: 1.0-draft &bull; Last Updated: [Publication Date]
          </p>
        </div>

        <StarterPolicyDisclaimer />

        {/* Policy Content Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7 }}>
          {/* Section 1 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              1. Current Storefront Status
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              DigiEcom is currently operating as a demonstration storefront. Purchases, real payment processing and commercial digital-product delivery are disabled.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Products displayed during this phase are sample demonstration listings. No real purchase or refund transaction can be initiated through this storefront.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              This draft policy will require review and finalization before commercial checkout is enabled.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              2. Scope of the Policy
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Once commercial operations begin, this policy will explain how DigiEcom handles cancellation requests, duplicate payments, defective or incomplete digital files, and other refund requests, subject to applicable Indian law.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Digital products may include PDF guides, engineering resources, spreadsheet templates, source-code materials and design assets, reflecting the intangible nature of digital products delivered electronically.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              3. Refund Eligibility
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Following commercial launch, refund requests will be assessed individually under the published policy and applicable law. Potential grounds for review include:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li>
                <strong>Defective or Incomplete Files:</strong> A delivered product is corrupted, inaccessible, materially incomplete, or does not match its advertised description.
              </li>
              <li>
                <strong>Duplicate Payment:</strong> The same order results in multiple confirmed charges.
              </li>
              <li>
                <strong>Delivery Failure:</strong> Payment is confirmed but the purchased digital product is not made available as promised.
              </li>
              <li>
                <strong>Cancellation Before Delivery:</strong> A cancellation request is made before the digital product is made available, subject to applicable law and the circumstances of the order.
              </li>
              <li>
                <strong>Other Legal Entitlements:</strong> Any refund or remedy required under applicable law.
              </li>
            </ul>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>
              Accessing or downloading a digital product does not automatically remove any consumer rights that cannot legally be excluded.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              4. Refund Requests
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              After commercial launch, customers may contact:
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(198, 255, 101, 0.08)',
                border: '1px solid rgba(198, 255, 101, 0.25)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <Mail size={16} color="var(--lime)" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>
                Support Email:{' '}
                <a
                  href="mailto:digiecomsupport1@gmail.com"
                  style={{ color: 'var(--lime)', textDecoration: 'underline' }}
                >
                  digiecomsupport1@gmail.com
                </a>
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Please include:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>Order ID or transaction reference.</li>
              <li>Email address used for the order.</li>
              <li>A description of the issue.</li>
              <li>Relevant screenshots or error details, where available.</li>
            </ul>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: 'var(--space-3)',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                color: '#fca5a5',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Security Reminder:</strong> Do not send passwords, full payment-card details or other sensitive payment credentials.
              </span>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              5. Review and Refund Processing
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Refund requests will be reviewed within <span className="code-inline">[Support Response Time]</span> after commercial operations begin.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Where a refund is approved, it will be processed through the applicable payment-provider procedure and within the timeframe required by law. The time taken for the amount to appear in the customer's account may depend on the payment provider and bank.
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Any legally prescribed deadlines will take precedence over internal processing estimates.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              6. Business and Grievance Contact Details
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'var(--bg-surface-elevated, #201d35)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-card)',
                fontSize: 'var(--text-sm)',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Legal Business / Proprietor
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>[DigiEcom]</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer Support Email
                </span>
                <a href="mailto:digiecomsupport1@gmail.com" style={{ color: 'var(--lime)', fontWeight: 600 }}>
                  digiecomsupport1@gmail.com
                </a>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', fontSize: '11px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Applicable Jurisdiction
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>India, subject to applicable law.</strong>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              7. Policy Updates
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              This draft will be reviewed before DigiEcom accepts real payments. The published policy will identify its effective date and will not purport to exclude mandatory consumer rights.
            </p>
          </section>

          {/* Notice */}
          <div
            style={{
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--border-card)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <FileText size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Notice:</strong> This is a starter template, not legal advice. It must be reviewed and finalized for the actual business structure and applicable laws before commercial launch.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
