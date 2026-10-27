import React from 'react';
import {
  BookOpen,
  Sparkles,
  BarChart3,
  FileCheck2,
  Workflow,
  Brain,
  Palette,
  Box,
  Headphones,
  Terminal,
} from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCoverVisualProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductCoverVisual: React.FC<ProductCoverVisualProps> = ({
  product,
  size = 'md',
  className = '',
}) => {
  const heightClass =
    size === 'sm' ? 'h-36' : size === 'lg' ? 'h-72 md:h-80' : 'h-48 sm:h-52';

  const getVisualIcon = () => {
    switch (product.coverVisualType) {
      case 'playbook':
        return <BookOpen size={size === 'lg' ? 44 : 28} className="text-violet-300" />;
      case 'ai':
        return <Sparkles size={size === 'lg' ? 44 : 28} className="text-lime-300" />;
      case 'finance':
        return <BarChart3 size={size === 'lg' ? 44 : 28} className="text-orange-300" />;
      case 'legal':
        return <FileCheck2 size={size === 'lg' ? 44 : 28} className="text-indigo-300" />;
      case 'notion':
        return <Workflow size={size === 'lg' ? 44 : 28} className="text-cyan-300" />;
      case 'obsidian':
        return <Brain size={size === 'lg' ? 44 : 28} className="text-purple-300" />;
      case 'design':
        return <Palette size={size === 'lg' ? 44 : 28} className="text-pink-300" />;
      case 'illustration':
        return <Box size={size === 'lg' ? 44 : 28} className="text-fuchsia-300" />;
      case 'audio':
        return <Headphones size={size === 'lg' ? 44 : 28} className="text-sky-300" />;
      case 'dotfiles':
      default:
        return <Terminal size={size === 'lg' ? 44 : 28} className="text-emerald-300" />;
    }
  };

  return (
    <div
      className={`cover-visual-wrapper ${heightClass} ${className}`}
      style={{
        background: product.coverGradient,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: size === 'lg' ? 'var(--radius-xl)' : 'var(--radius-md) var(--radius-md) 0 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-card)',
      }}
      role="img"
      aria-label={`Visual cover graphic for ${product.name}`}
    >
      {/* Background geometric accents */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,239,138,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: Format badge & Demo tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <span
          className="badge"
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-secondary)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
          }}
        >
          {product.fileFormats.slice(0, 2).join(' ')}
        </span>
        <span className="badge badge-demo" style={{ fontSize: '10px' }}>
          DEMO
        </span>
      </div>

      {/* Middle row: Icon and visual graphic */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          zIndex: 2,
          padding: 'var(--space-2) 0',
        }}
      >
        <div
          className="cover-visual-icon"
          style={{
            width: size === 'lg' ? '72px' : '52px',
            height: size === 'lg' ? '72px' : '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {getVisualIcon()}
        </div>
      </div>

      {/* Bottom row: Category badge and Subtle Title preview */}
      <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.85)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {product.categoryLabel}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--accent-lime)',
            fontWeight: 600,
          }}
        >
          DRM-Free
        </span>
      </div>
    </div>
  );
};
