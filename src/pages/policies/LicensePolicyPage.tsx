import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { StarterPolicyDisclaimer } from '../../components/common/StarterPolicyDisclaimer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const LicensePolicyPage: React.FC = () => {
  useDocumentTitle(
    'Product License & Acceptable Use — DigiEcom',
    'Starter Product License and Acceptable Use Policy template for digital products storefront.'
  );

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow">
        <Breadcrumbs items={[{ label: 'Legal Policies', path: '/about' }, { label: 'License & Acceptable Use' }]} />

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
            Product License and Acceptable Use Policy
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Last Updated: [Date of Commercial Launch] &bull; Version 1.0-draft
          </p>
        </div>

        <StarterPolicyDisclaimer />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', lineHeight: 1.7 }}>
          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              1. Grant of License
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              When you purchase a digital product from <span className="code-inline">[Legal Business Entity Name]</span> (&ldquo;DigiEcom&rdquo;), you are granted a non-exclusive, non-transferable, revocable license to use the licensed digital assets in accordance with the specific license tier purchased. Title and intellectual property rights remain with <span className="code-inline">[Legal Business Entity Name]</span> or its contributing authors.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              2. Standard License Tiers
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-card)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent-lime)', marginBottom: 'var(--space-1)' }}>
                  A. Single-User Personal / Developer License
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Permits installation, local reading, and execution on up to <span className="code-inline">[3 personal machines]</span> owned or operated by the individual licensee. May be used for personal projects and individual freelance assignments.
                </p>
              </div>

              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-card)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent-violet)', marginBottom: 'var(--space-1)' }}>
                  B. Commercial Team / Workspace License
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Permits deployment and shared usage across internal organization workspaces (e.g., Notion team spaces, internal Figma libraries, company Git repositories) for up to the designated headcount specified on the order receipt.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              3. Strictly Prohibited Activities
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Regardless of license tier, the licensee shall NOT:
            </p>
            <ul style={{ paddingLeft: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>Sub-license, resell, lease, donate, or distribute the raw digital source files (e.g., sharing raw .fig, .blend, .docx, .json prompt files via public GitHub repositories or file-sharing websites).</li>
              <li>Include our digital components in open-source starter kits, website templates, or design builders where end-users can extract raw source components.</li>
              <li>Use product contents to train public foundation machine learning models without express written consent.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              4. Termination & Copyright Enforcement
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Failure to abide by these terms results in automatic termination of the license without refund. <span className="code-inline">[Legal Business Entity Name]</span> reserves all statutory remedies available under the Copyright Act of <span className="code-inline">[Applicable Jurisdiction]</span> and international treaties. For licensing inquiries, email <span className="code-inline">[licensing@yourdomain.com]</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
