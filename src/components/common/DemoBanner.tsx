import React from 'react';
import { Link } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Demonstration Storefront Status Notice"
      className="announcement"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      <span>Digital resources for your next big idea <span aria-hidden="true">✳</span> New storefront preview</span>
      <span style={{ opacity: 0.85, fontWeight: 700 }}>&bull; Demonstration only: checkout & delivery disabled</span>
      <Link
        to="/about#storefront-status"
        style={{
          textDecoration: 'underline',
          fontWeight: 800,
          color: 'var(--ink)',
          marginLeft: '4px',
        }}
      >
        Learn more &rarr;
      </Link>
    </div>
  );
};
