import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Search } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 Page Not Found', 'The requested page could not be located on DigiEcom.');

  return (
    <div style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-20)' }}>
      <div className="container container-narrow" style={{ textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: 'var(--space-16) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={32} />
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 800,
              color: 'var(--accent-lime)',
            }}
          >
            404
          </span>

          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800 }}>
            Page Not Found
          </h1>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6 }}>
            The URL you requested does not exist on DigiEcom storefront. It may have been moved or mistyped.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Link to="/products" className="btn btn-primary">
              <Search size={16} />
              <span>Browse Digital Catalogue</span>
            </Link>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
