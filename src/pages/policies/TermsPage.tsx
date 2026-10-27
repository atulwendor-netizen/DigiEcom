import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarterPolicyDisclaimer } from '../../components/common/StarterPolicyDisclaimer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const TermsPage: React.FC = () => {
  useDocumentTitle(
    'Terms and Conditions — DigiEcom',
    'Starter Terms and Conditions agreement for DigiEcom digital products storefront.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Legal Policies', path: '/about' }, { label: 'Terms and Conditions' }]} />

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
            Terms and Conditions
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Last Updated: [Date of Commercial Launch] &bull; Version 1.0-draft
          </p>
        </div>

        <StarterPolicyDisclaimer />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              1. Agreement to Terms
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&ldquo;Customer&rdquo; or &ldquo;You&rdquo;), and <span className="code-inline">[Legal Business Entity Name]</span> (&ldquo;DigiEcom&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), concerning your access to and use of our digital storefront and digital assets.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              2. Nature of Digital Products & Storefront Status
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              All items featured on DigiEcom are intangible digital products (e-books, templates, code presets, prompt databases, and design tokens). In the current storefront preview release, products are displayed for demonstration and architectural validation; order submission and payment settlement are non-functional until subsequent production deployment.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              3. Intellectual Property Rights & Non-Exclusive License
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Unless otherwise indicated, all proprietary content, code, branding, and layouts are the intellectual property of <span className="code-inline">[Legal Business Entity Name]</span> or licensed authors. Purchase of a product grants the Customer a revocable, non-exclusive, non-transferable license to use the digital asset in accordance with the specific License Tier stated on the product page. You may not resell, sub-license, mirror, or repackage digital raw assets as competing standalone products.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              4. Pricing & Currency Representation
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              All prices displayed on this storefront are quoted in Indian Rupees (INR) and architecturally structured in integer paise representations. Prices are subject to change without prior notice prior to payment settlement. We reserve the right to correct typographical or calculation errors.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              5. Disclaimer of Professional Advice & Guarantees
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Digital materials provided on DigiEcom—including legal contract templates, business projection models, and engineering architectures—are for educational and foundational reference only. They do not constitute formal legal, financial, or certified engineering advice. We make no warranty that use of our products will guarantee specific financial yields, venture funding, or error-free software execution.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              6. Limitation of Liability & Governing Law
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              To the maximum extent permitted by applicable law, in no event shall <span className="code-inline">[Legal Business Entity Name]</span> be liable for indirect, incidental, consequential, or punitive damages resulting from the use or inability to use our digital assets. These Terms shall be governed by and construed in accordance with the laws of <span className="code-inline">[City/State, Jurisdiction, Country]</span>, without regard to conflict of law principles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
