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
  const getVisualIcon = () => {
    const iconSize = size === 'lg' ? 36 : 24;
    switch (product.coverVisualType) {
      case 'playbook':
        return <BookOpen size={iconSize} />;
      case 'ai':
        return <Sparkles size={iconSize} />;
      case 'finance':
        return <BarChart3 size={iconSize} />;
      case 'legal':
        return <FileCheck2 size={iconSize} />;
      case 'notion':
        return <Workflow size={iconSize} />;
      case 'obsidian':
        return <Brain size={iconSize} />;
      case 'design':
        return <Palette size={iconSize} />;
      case 'illustration':
        return <Box size={iconSize} />;
      case 'audio':
        return <Headphones size={iconSize} />;
      case 'dotfiles':
      default:
        return <Terminal size={iconSize} />;
    }
  };

  const getThemeClass = () => {
    switch (product.category) {
      case 'ebooks-guides':
        return 'lime';
      case 'ai-prompts':
        return 'pink';
      case 'business-templates':
        return 'orange';
      case 'productivity-tools':
        return 'lavender';
      case 'design-assets':
        return 'pink';
      case 'other-downloads':
      default:
        return 'lime';
    }
  };

  return (
    <div
      className={`demo-product-art ${getThemeClass()} ${className}`}
      style={{
        background: product.coverGradient,
        minHeight: size === 'sm' ? '140px' : size === 'lg' ? '280px' : '200px',
      }}
      role="img"
      aria-label={`Visual cover graphic for ${product.name}`}
    >
      {/* 3D Tilted Cover from Demo */}
      <div
        className="cover"
        style={{
          position: 'relative',
          zIndex: 1,
          width: size === 'lg' ? '50%' : '52%',
          aspectRatio: '0.76',
          border: '1px solid rgba(23, 21, 38, 0.2)',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.18)',
          boxShadow: '10px 12px 24px rgba(23, 21, 38, 0.25)',
          padding: '12px',
          color: 'var(--ink)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small
            style={{
              fontSize: '0.52rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            DIGIECOM / {product.fileFormats[0] || 'ASSET'}
          </small>
          <span
            className="badge badge-demo"
            style={{
              fontSize: '9px',
              padding: '0.1rem 0.4rem',
              background: 'rgba(23, 21, 38, 0.85)',
              color: 'var(--lime)',
            }}
          >
            DEMO
          </span>
        </div>

        <div style={{ textAlign: 'center', margin: '4px 0' }}>
          <div
            className="cover-visual-icon"
            style={{
              display: 'inline-flex',
              padding: '8px',
              borderRadius: '50%',
              background: 'rgba(23, 21, 38, 0.12)',
            }}
          >
            {getVisualIcon()}
          </div>
          <strong
            style={{
              display: 'block',
              marginTop: '6px',
              fontSize: size === 'lg' ? '1.05rem' : '0.82rem',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              fontWeight: 900,
            }}
          >
            {product.categoryLabel.toUpperCase()}
          </strong>
        </div>

        <div>
          <div
            style={{
              width: '70%',
              height: '4px',
              borderRadius: '4px',
              background: 'currentColor',
              opacity: 0.35,
              marginBottom: '3px',
            }}
          />
          <div
            style={{
              width: '45%',
              height: '4px',
              borderRadius: '4px',
              background: 'currentColor',
              opacity: 0.25,
            }}
          />
        </div>
      </div>
    </div>
  );
};
