import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const StarterPolicyDisclaimer: React.FC = () => {
  return (
    <div
      className="notice-banner notice-warning"
      style={{ marginBottom: 'var(--space-8)' }}
      role="note"
      aria-label="Legal Template Disclaimer"
    >
      <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <strong>Starter Legal Template Notice:</strong> This document is an editable starter draft provided for
        storefront demonstration purposes. Text enclosed in brackets such as{' '}
        <span className="code-inline">[Legal Business Name]</span>,{' '}
        <span className="code-inline">[Applicable Jurisdiction]</span>, and{' '}
        <span className="code-inline">[Support Email]</span> are placeholders that must be customized and reviewed by
        qualified legal counsel under applicable e-commerce and consumer protection laws before commercial launch.
      </div>
    </div>
  );
};
