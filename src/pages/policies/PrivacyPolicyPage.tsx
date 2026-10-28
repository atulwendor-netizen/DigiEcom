import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarterPolicyDisclaimer } from '../../components/common/StarterPolicyDisclaimer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const PrivacyPolicyPage: React.FC = () => {
  useDocumentTitle(
    'Privacy Policy — DigiEcom',
    'Starter Privacy Policy template for DigiEcom digital products storefront.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Legal Policies', path: '/about' }, { label: 'Privacy Policy' }]} />

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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Last Updated: [Date of Commercial Launch] &bull; Version 1.0-draft
          </p>
        </div>

        <StarterPolicyDisclaimer />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              1. Overview & Data Controller
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              This Privacy Policy explains how <span className="code-inline">[Legal Entity Name]</span> (&ldquo;DigiEcom&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, and safeguards information when you visit our digital products storefront located at <span className="code-inline">[Website Domain URL]</span>. For the purposes of applicable data protection legislation in <span className="code-inline">[Applicable Jurisdiction / Country]</span>, the data controller is <span className="code-inline">[Legal Entity Name]</span> with registered offices at <span className="code-inline">[Registered Business Address]</span>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              2. Data We Collect
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              In this static storefront preview release, no customer accounts, cookies, or payment card details are collected or stored in browser storage. In a future production environment with active checkout, we collect:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li><strong>Contact Information:</strong> Customer email address and name provided during checkout to facilitate digital receipt delivery and license generation.</li>
              <li><strong>Transactional Records:</strong> Order identification tokens, purchased items, timestamp, and payment provider confirmation references. Note that full credit card numbers and CVVs are processed directly by our PCI-DSS Level 1 compliant gateway provider and are NEVER handled or stored on DigiEcom servers.</li>
              <li><strong>Delivery Audit Logs:</strong> IP address and timestamp when authenticated digital download links are accessed, strictly for fraud mitigation and fulfillment verification.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              3. Purpose of Processing
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              We process personal information only when lawful grounds exist:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li><strong>Contract Fulfillment:</strong> Generating license keys, verifying payment status, and sending secure download links.</li>
              <li><strong>Customer Support:</strong> Responding to pre-purchase inquiries and technical assistance requests submitted to <span className="code-inline">digiecomsupport1@gmail.com</span>.</li>
              <li><strong>Legal Compliance:</strong> Maintaining financial transaction ledgers required under <span className="code-inline">[Tax / GST Regulations of Jurisdiction]</span>.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              4. Third-Party Disclosures & Trackers
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              We do not sell, rent, or trade your personal data. Data is shared exclusively with necessary infrastructure providers: payment gateways (<span className="code-inline">[e.g. Razorpay / Stripe]</span>), private cloud storage providers (<span className="code-inline">[e.g. AWS S3 / Cloudflare R2]</span>), and transactional email daemons under binding data processing agreements. We do not load intrusive third-party advertising tracking scripts.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              5. Your Legal Rights
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Depending on your jurisdiction, you have the right to request access to your personal information, request correction of erroneous records, request erasure (subject to statutory accounting record retention rules), and withdraw consent for optional marketing communications. To exercise your rights, email our privacy desk at <span className="code-inline">[privacy@yourdomain.com]</span>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              6. Policy Updates & Governance
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              This policy will be updated upon the activation of live payment processing. Prior to production launch, final terms will be reviewed and ratified in compliance with applicable laws of <span className="code-inline">[Applicable Jurisdiction]</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
