import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Briefcase,
  CheckCircle2,
  Layers,
  Terminal,
} from 'lucide-react';
import categoriesData from '../../data/categories.json';
import { RevealOnScroll } from '../common/RevealOnScroll';

export const CategoryExplorer: React.FC = () => {
  const getCategoryIcon = (iconName: string) => {
    const size = 22;
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen size={size} color="var(--ink)" />;
      case 'Sparkles':
        return <Sparkles size={size} color="var(--ink)" />;
      case 'Briefcase':
        return <Briefcase size={size} color="var(--ink)" />;
      case 'CheckCircle2':
        return <CheckCircle2 size={size} color="var(--ink)" />;
      case 'Layers':
        return <Layers size={size} color="var(--ink)" />;
      case 'Terminal':
      default:
        return <Terminal size={size} color="var(--ink)" />;
    }
  };

  const cardColors = ['card-lime', 'card-pink', 'card-orange', 'card-lavender'];

  return (
    <section
      id="category-explorer"
      aria-labelledby="categories-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-20)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="container">
        {/* Section Head matching demo */}
        <RevealOnScroll>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '28px',
              marginBottom: '36px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--lime)',
                  fontSize: '0.74rem',
                  fontWeight: 850,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Find your flow
              </div>
              <h2
                id="categories-heading"
                style={{
                  margin: '9px 0 0',
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                  letterSpacing: '-0.065em',
                  lineHeight: 1.04,
                  fontWeight: 900,
                }}
              >
                Good ideas need<br />good tools.
              </h2>
            </div>
            <p
              style={{
                maxWidth: '420px',
                color: 'var(--muted)',
                margin: 0,
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              Explore thoughtfully designed resources for learning, creating and getting work done &bull; all categorized with clear licensing and formats.
            </p>
          </div>
        </RevealOnScroll>

        {/* 6 Category Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {categoriesData.map((cat, idx) => {
            const colorClass = cardColors[idx % cardColors.length];
            return (
              <RevealOnScroll key={cat.id} delay={idx * 60} style={{ height: '100%' }}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className={`demo-category-card ${colorClass}`}
                >
                  <span className="category-icon-box" aria-hidden="true">
                    {getCategoryIcon(cat.iconName)}
                  </span>
                  <div>
                    <h3
                      style={{
                        margin: '22px 0 4px',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        letterSpacing: '-0.04em',
                        color: 'var(--ink)',
                      }}
                    >
                      {cat.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.84rem',
                        opacity: 0.85,
                        color: 'var(--ink)',
                        lineHeight: 1.4,
                      }}
                    >
                      {cat.description}
                    </p>
                  </div>
                  <span className="category-arrow-icon" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};
