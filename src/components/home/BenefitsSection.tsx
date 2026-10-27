import React from 'react';
import { BookOpen, Sparkles, Briefcase, Workflow, Palette, Terminal } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      title: 'Technical E-books & Guides',
      icon: <BookOpen size={22} color="var(--accent-violet)" />,
      badge: 'Architecture & Theory',
      description:
        'Provides structured, deep conceptual foundations and practical trade-off analyses for system design, distributed databases, and engineering workflows without marketing fluff.',
    },
    {
      title: 'Benchmarked AI Prompts',
      icon: <Sparkles size={22} color="var(--accent-lime)" />,
      badge: 'Evaluation & Context',
      description:
        'Helps engineering and product teams establish consistent, repeatable LLM outputs with explicit negative constraints, few-shot schemas, and regression rubrics.',
    },
    {
      title: 'Business & Financial Models',
      icon: <Briefcase size={22} color="var(--accent-orange)" />,
      badge: 'Planning & Governance',
      description:
        'Delivers dynamic spreadsheet architectures that structure SaaS cohort economics, unit costs, and commercial contract clauses for internal alignment.',
    },
    {
      title: 'Productivity Frameworks',
      icon: <Workflow size={22} color="var(--accent-cyan)" />,
      badge: 'Workflow Organization',
      description:
        'Organizes personal and team knowledge across Notion and Obsidian with linked databases, clear taxonomies, and reproducible daily rituals.',
    },
    {
      title: 'Design Systems & UI Assets',
      icon: <Palette size={22} color="var(--accent-pink)" />,
      badge: 'Design Consistency',
      description:
        'Supplies design-token-ready components and 3D illustration assets that maintain WCAG accessibility standards and unify multi-platform styling.',
    },
    {
      title: 'Developer Configs & Dotfiles',
      icon: <Terminal size={22} color="#10ef8a" />,
      badge: 'Ergonomic Tooling',
      description:
        'Offers reproducible workstation configurations, editor LSP bindings, and terminal shortcuts that streamline local developer navigation.',
    },
  ];

  return (
    <section
      aria-labelledby="benefits-heading"
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
        backgroundColor: 'rgba(16, 12, 36, 0.4)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-12) auto' }}>
          <span className="badge badge-lime" style={{ marginBottom: 'var(--space-2)' }}>
            Real Utility Focus
          </span>
          <h2
            id="benefits-heading"
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-3)',
            }}
          >
            How Digital Assets Support Real Workflows
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            We focus on transparent deliverables and practical tools. We avoid hype and make no unsubstantiated
            revenue or automated outcome claims.
          </p>
        </div>

        {/* Benefits Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {benefit.icon}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                  }}
                >
                  {benefit.badge}
                </span>
              </div>

              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {benefit.title}
              </h3>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
