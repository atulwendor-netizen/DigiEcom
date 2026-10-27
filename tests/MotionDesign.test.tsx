import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { BrandLogo } from '../src/components/common/BrandLogo';
import { RevealOnScroll } from '../src/components/common/RevealOnScroll';

describe('Motion Design System Integrity', () => {
  it('renders accessible BrandLogo with SVG geometry and animated stroke properties', () => {
    const { container } = render(<BrandLogo size="md" showTagline={true} />);

    // Renders with accessible label
    expect(screen.getByLabelText(/DigiEcom Logo/i)).toBeInTheDocument();

    // SVG element is present
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // Contains stylized paths
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);

    // Contains wordmark
    expect(screen.getByText('DigiEcom')).toBeInTheDocument();
    expect(screen.getByText('Storefront')).toBeInTheDocument();
  });

  it('renders RevealOnScroll with progressive enhancement and resilient visibility', () => {
    const { container } = render(
      <RevealOnScroll delay={100} className="custom-reveal">
        <p>Test motion content</p>
      </RevealOnScroll>
    );

    const revealWrapper = container.querySelector('.reveal-fade-up');
    expect(revealWrapper).toBeInTheDocument();
    expect(revealWrapper).toHaveClass('custom-reveal');
    expect(screen.getByText('Test motion content')).toBeInTheDocument();
  });

  it('verifies motion.css includes strict prefers-reduced-motion overrides', () => {
    const motionCssPath = path.resolve(process.cwd(), 'src/styles/motion.css');
    expect(fs.existsSync(motionCssPath)).toBe(true);

    const cssContent = fs.readFileSync(motionCssPath, 'utf-8');

    // Reduced motion media query exists
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');

    // Disables float animations and transitions
    expect(cssContent).toContain('animation-duration: 0.001ms !important');
    expect(cssContent).toContain('hero-float-primary');
    expect(cssContent).toContain('hero-float-secondary');

    // Contains responsive mobile float disable query (< 768px)
    expect(cssContent).toContain('@media (max-width: 768px)');
  });

  it('verifies GPU-accelerated keyframe animations exist in motion.css', () => {
    const motionCssPath = path.resolve(process.cwd(), 'src/styles/motion.css');
    const cssContent = fs.readFileSync(motionCssPath, 'utf-8');

    expect(cssContent).toContain('@keyframes fadeInUp');
    expect(cssContent).toContain('@keyframes gentleFloatPrimary');
    expect(cssContent).toContain('@keyframes svgStrokeDraw');
    expect(cssContent).toContain('@keyframes mobileDrawerSlide');
    expect(cssContent).toContain('@keyframes ambientGlowPulse');

    // Standalone demo keyframe migrations
    expect(cssContent).toContain('@keyframes draw-mark');
    expect(cssContent).toContain('@keyframes core-pop');
    expect(cssContent).toContain('@keyframes text-rise');
    expect(cssContent).toContain('@keyframes float-main');
    expect(cssContent).toContain('@keyframes marquee');
  });
});
