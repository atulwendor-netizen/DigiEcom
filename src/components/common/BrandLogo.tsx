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
    sm: { box: 30, font: '1.15rem', tagFont: '9px' },
    md: { box: 38, font: '1.38rem', tagFont: '10px' },
    lg: { box: 46, font: '1.65rem', tagFont: '11px' },
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
        gap: '11px',
        cursor: 'pointer',
        userSelect: 'none',
        textDecoration: 'none',
      }}
      aria-label={`${siteConfig.brandName} Logo`}
    >
      {/* Standalone Demo Animated SVG Mark */}
      <svg
        className="brand-mark"
        viewBox="0 0 44 44"
        role="img"
        aria-label="DigiEcom mark"
        style={{
          width: `${currentSize.box}px`,
          height: `${currentSize.box}px`,
          overflow: 'visible',
          transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform var(--duration-fast) var(--ease-out-smooth)',
          flexShrink: 0,
        }}
      >
        <path
          className="mark-outline"
          d="M22 3.5 39.5 13.7v16.6L22 40.5 4.5 30.3V13.7Z"
          fill="none"
          stroke="var(--lime)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          className="mark-core"
          d="M14 13.5h9.5c5.1 0 8.5 3.2 8.5 8.5s-3.4 8.5-8.5 8.5H14V13.5Zm6 5v7h3.2c1.7 0 2.7-1.2 2.7-3.5s-1-3.5-2.7-3.5H20Z"
          fill="var(--lime)"
        />
      </svg>

      {/* Wordmark & Optional Tagline */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            className="brand-word"
            style={{
              fontSize: currentSize.font,
              fontWeight: 900,
              letterSpacing: '-0.055em',
              background: 'linear-gradient(to right, #f8f7ff 44%, var(--lime) 44%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
              transition: 'filter var(--duration-fast) var(--ease-out-smooth)',
              filter: isHovered ? 'brightness(1.15)' : 'none',
            }}
          >
            DigiEcom
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: currentSize.tagFont,
                fontFamily: 'var(--font-mono)',
                color: isHovered ? 'var(--lime)' : 'var(--muted)',
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
