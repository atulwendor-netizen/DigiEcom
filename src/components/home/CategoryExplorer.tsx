import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Layers,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import categoriesData from '../../data/categories.json';
import { RevealOnScroll } from '../common/RevealOnScroll';

export const CategoryExplorer: React.FC = () => {
  const getCategoryIcon = (iconName: string, accentColor: string) => {
    const size = 26;
    const colorMap: Record<string, string> = {
      violet: '#c084fc',
      lime: '#10ef8a',
      orange: '#fb923c',
      cyan: '#38bdf8',
      pink: '#f472b6',
    };
    const color = colorMap[accentColor] || '#10ef8a';

    switch (iconName) {
      case 'BookOpen':
        return <BookOpen size={size} color={color} />;
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      case 'Briefcase':
        return <Briefcase size={size} color={color} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={size} color={color} />;
      case 'Layers':
        return <Layers size={size} color={color} />;
      case 'Terminal':
      default:
        return <Terminal size={size} color={color} />;
    }
  };

  return (
    <section
      id="category-explorer"
      aria-labelledby="categories-heading"
      style={{
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-16)',
        backgroundColor: 'rgba(16, 12, 36, 0.4)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <RevealOnScroll>
          <div style={{ marginBottom: 'var(--space-10)', textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-10) auto' }}>
            <span className="badge badge-violet" style={{ marginBottom: 'var(--space-2)' }}>
              Curated Collections
            </span>
            <h2
              id="categories-heading"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 'var(--space-3)',
              }}
            >
              Explore Digital Assets by Discipline
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Each category is organized with verified file formats, compatibility notes, and clear licensing scopes.
            </p>
          </div>
        </RevealOnScroll>

        {/* 6 Category Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {categoriesData.map((cat, idx) => (
            <RevealOnScroll key={cat.id} delay={idx * 60} style={{ height: '100%' }}>
              <Link
                to={`/products?category=${cat.id}`}
                className="card card-interactive"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 'var(--space-6)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  height: '100%',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getCategoryIcon(cat.iconName, cat.accentColor)}
                    </div>
                    <span
                      className="badge"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {cat.popularFormats.join(' ')}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 700,
                      marginBottom: 'var(--space-2)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                    {cat.tagline}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--accent-lime)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-card)',
                  }}
                >
                  <span>Browse {cat.name}</span>
                  <ArrowRight size={14} className="category-arrow" />
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};
