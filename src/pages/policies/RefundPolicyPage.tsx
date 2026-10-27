import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarterPolicyDisclaimer } from '../../components/common/StarterPolicyDisclaimer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const RefundPolicyPage: React.FC = () => {
  useDocumentTitle(
    'Refund & Cancellation Policy — DigiEcom',
    'Starter Refund and Cancellation Policy template for digital products storefront.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Legal Policies', path: '/about' }, { label: 'Refund & Cancellation Policy' }]} />

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
            Refund and Cancellation Policy
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Last Updated: [Date of Commercial Launch] &bull; Version 1.0-draft
          </p>
        </div>

        <StarterPolicyDisclaimer />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              1. Intangible Nature of Digital Products
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Because digital assets (such as downloadable PDF guides, source code files, spreadsheet models, and Figma libraries) are delivered electronically and cannot be physically returned once decrypted or downloaded, our refund and cancellation policies reflect standard commercial practices for intangible software goods under <span className="code-inline">[Applicable Consumer Protection Laws of Jurisdiction]</span>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              2. Eligibility Criteria for Refunds
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Once checkout and fulfillment are active in production, <span className="code-inline">[Legal Business Entity Name]</span> considers refund requests under the following documented circumstances:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li><strong>Critical File Defect or Incompleteness:</strong> If the delivered asset archive is corrupted, missing advertised files, and our technical support cannot provide a corrected copy within <span className="code-inline">[48 to 72 business hours]</span> of report.</li>
              <li><strong>Duplicate Transaction:</strong> In the event of an accidental duplicate charge resulting from a gateway timeout or network failure, duplicate payments will be refunded in full.</li>
              <li><strong>Pre-Download Cancellation:</strong> If a customer cancels an order prior to accessing the private download link or generating a signed fulfillment token, a full refund may be issued subject to gateway handling fees.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              3. Ineligible Circumstances
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Refunds will generally not be granted for:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>Change of mind after the product files have been downloaded or opened.</li>
              <li>Failure to read stated software compatibility or minimum system specifications (e.g. attempting to open a Figma `.fig` file in unsupported graphics software).</li>
              <li>Unrealistic expectations contrary to our express disclaimers of commercial guarantees.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              4. Refund Request Procedure
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              To request a refund review, contact our support team at <span className="code-inline">[refunds@yourdomain.com]</span> within <span className="code-inline">[7 to 14 days]</span> of transaction with:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>Your order identification number and customer email address.</li>
              <li>A description of the technical issue or defect encountered, including screenshot or error logs.</li>
            </ul>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Approved refunds will be processed back to the original method of payment within <span className="code-inline">[5 to 10 banking days]</span> depending on your financial institution.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
