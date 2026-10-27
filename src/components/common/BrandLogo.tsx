import React, { useState } from 'react';
import { siteConfig } from '../../config/siteConfig';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSizes = {
    sm: { box: 30, font: 'var(--text-base)', tagFont: '9px' },
    md: { box: 38, font: 'var(--text-xl)', tagFont: '10px' },
    lg: { box: 46, font: 'var(--text-2xl)', tagFont: '11px' },
  };

  const currentSize = iconSizes[size];

  return (
    <div
      className={`brand-logo-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      aria-label={`${siteConfig.brandName} Logo`}
    >
      {/* Geometric Animated SVG Icon */}
      <div
        style={{
          width: `${currentSize.box}px`,
          height: `${currentSize.box}px`,
          borderRadius: size === 'sm' ? 'var(--radius-sm)' : 'var(--radius-md)',
          background: 'linear-gradient(135deg, #0d0920 0%, #1e123d 100%)',
          border: `1px solid ${isHovered ? 'rgba(16, 239, 138, 0.5)' : 'rgba(168, 85, 247, 0.4)'}`,
          boxShadow: isHovered
            ? '0 0 20px var(--accent-lime-glow), 0 0 10px var(--accent-violet-glow)'
            : '0 0 14px var(--accent-violet-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color var(--duration-fast) var(--ease-out-smooth), box-shadow var(--duration-fast) var(--ease-out-smooth), transform var(--duration-fast) var(--ease-out-smooth)',
          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '80%', height: '80%' }}
          role="img"
          aria-hidden="true"
        >
          {/* Base Geometric Frame */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="10"
            stroke="rgba(168, 85, 247, 0.25)"
            strokeWidth="1.5"
          />

          {/* Stylized 'D' Arch (Violet Stroke) */}
          <path
            d="M14 12H24C29.5228 12 34 16.4772 34 22C34 27.5228 29.5228 32 24 32H14V12Z"
            stroke="#A855F7"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 90,
              strokeDashoffset: 0,
              animation: 'svgStrokeDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transition: 'stroke 0.2s ease',
            }}
          />

          {/* Inner Digital Flow Branch (Lime Stroke) */}
          <path
            d="M14 24H25C27.2091 24 29 25.7909 29 28C29 30.2091 27.2091 32 25 32H14"
            stroke={isHovered ? '#10EF8A' : '#10EF8A'}
            strokeWidth="3.2"
            strokeLinecap="round"
            style={{
              strokeDasharray: 55,
              strokeDashoffset: 0,
              animation: 'svgStrokeDraw 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />

          {/* Accent Nodes (Orange & Pink) */}
          <circle
            cx="34"
            cy="34"
            r="3.5"
            fill="#F97316"
            style={{
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isHovered ? 'scale(1.2)' : 'scale(1)',
              transformOrigin: '34px 34px',
            }}
          />
          <circle
            cx="14"
            cy="14"
            r="2.5"
            fill="#EC4899"
            style={{
              transition: 'opacity 0.2s ease',
              opacity: isHovered ? 1 : 0.85,
            }}
          />
        </svg>
      </div>

      {/* Wordmark & Optional Tagline */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: currentSize.font,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: isHovered
                ? 'linear-gradient(135deg, #ffffff 0%, #10ef8a 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #10ef8a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
              transition: 'background var(--duration-fast) var(--ease-out-smooth)',
            }}
          >
            {siteConfig.brandName}
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: currentSize.tagFont,
                fontFamily: 'var(--font-mono)',
                color: isHovered ? 'var(--accent-lime)' : 'var(--accent-violet)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                transition: 'color var(--duration-fast) var(--ease-out-smooth)',
              }}
            >
              Storefront
            </span>
          )}
        </div>
      )}
    </div>
  );
};
