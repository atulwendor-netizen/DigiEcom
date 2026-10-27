import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        marginBottom: 'var(--space-6)',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} color="var(--text-dim)" aria-hidden="true" />
            {isLast || !item.path ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                style={{
                  color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isLast ? 600 : 400,
                  maxWidth: '280px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lime)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
