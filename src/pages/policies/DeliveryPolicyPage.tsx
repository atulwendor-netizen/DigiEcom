import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarterPolicyDisclaimer } from '../../components/common/StarterPolicyDisclaimer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const DeliveryPolicyPage: React.FC = () => {
  useDocumentTitle(
    'Digital Delivery Policy — DigiEcom',
    'Starter Digital Delivery Policy template for digital products storefront.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Legal Policies', path: '/about' }, { label: 'Digital Delivery Policy' }]} />

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span className="badge badge-violet" style={{ marginBottom: 'var(--space-2)' }}>
            Editable Draft Template
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Digital Delivery Policy
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Last Updated: [Date of Commercial Launch] &bull; Version 1.0-draft
          </p>
        </div>

        <StarterPolicyDisclaimer />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              1. Delivery Method & Fulfillment Architecture
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              All digital products sold on DigiEcom are 100% digital and delivered electronically over the internet. No physical goods, CD-ROMs, printed binders, or tangible packaging are manufactured or dispatched.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              2. Order Timing & Access Provisioning
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              In the future production release with active checkout:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li><strong>Instant Automated Access:</strong> Immediately upon successful receipt of server-side cryptographic payment confirmation from our gateway provider, an authenticated order confirmation email containing your secure download link will be dispatched to your billing email address within <span className="code-inline">[5 to 15 minutes]</span>.</li>
              <li><strong>Order Confirmation Screen:</strong> A direct one-time token access link will also be displayed on your verified post-checkout session receipt page.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              3. Secure Signed URLs & Download Expiration
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              To protect customer data and creator intellectual property, product files are NOT hosted in public static web roots. All downloads are generated as cryptographically signed, short-lived URLs (<span className="code-inline">[valid for 24 to 72 hours]</span>). Customers may regenerate active download links through their order lookup portal or by contacting support up to <span className="code-inline">[5 to 10 download attempts]</span> per purchase.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              4. Delivery Failures & Support Procedures
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              If you do not receive your digital confirmation email within <span className="code-inline">[30 minutes]</span> of a successful transaction:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>Check your email spam, promotions, or quarantine folders for messages originating from <span className="code-inline">[delivery@yourdomain.com]</span>.</li>
              <li>Confirm there were no typos in the email address submitted during checkout.</li>
              <li>Email our fulfillment desk at <span className="code-inline">digiecomsupport1@gmail.com</span> with your transaction reference number. Our team will verify the payment ledger and re-issue signed links manually within <span className="code-inline">[24 business hours]</span>.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
