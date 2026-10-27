import React from 'react';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Demonstration Storefront Status Notice"
      style={{
        background: 'linear-gradient(90deg, #1b1238 0%, #17112e 100%)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.25)',
        padding: 'var(--space-2) var(--space-4)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Info size={14} color="var(--accent-lime)" aria-hidden="true" />
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>Storefront Preview Release:</strong>{' '}
            Sample digital catalogue for demonstration. Payment processing & delivery are currently disabled.
          </span>
        </div>
        <Link
          to="/about#storefront-status"
          style={{
            color: 'var(--accent-lime)',
            textDecoration: 'underline',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}
        >
          Learn more &rarr;
        </Link>
      </div>
    </div>
  );
};
