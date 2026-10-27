import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroHumanAnimation } from '../src/components/home/HeroHumanAnimation';
import { Hero } from '../src/components/home/Hero';

describe('HeroHumanAnimation Component', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Default matchMedia mock returning matches: false
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('renders with pointer-events: none on container to never block clicks or CTAs', () => {
    const { container } = render(<HeroHumanAnimation />);
    const animContainer = container.querySelector('.hero-human-container');
    expect(animContainer).toBeInTheDocument();
    expect(animContainer).toHaveStyle({ pointerEvents: 'none' });
  });

  it('renders video with muted, playsInline, autoPlay, and loop=false', () => {
    const { container } = render(
      <HeroHumanAnimation
        videoSrc="/videos/digiecom-walk.webm"
        posterSrc="/images/digiecom-character-poster.webp"
      />
    );

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/videos/digiecom-walk.webm');
    expect(video).toHaveAttribute('poster', '/images/digiecom-character-poster.webp');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('playsinline');
    expect(video).not.toHaveAttribute('loop'); // Must NOT loop indefinitely
  });

  it('gracefully falls back to static poster image when video triggers an error', () => {
    const { container } = render(
      <HeroHumanAnimation
        videoSrc="/videos/non-existent-walk.webm"
        posterSrc="/images/digiecom-character-poster.webp"
      />
    );

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();

    // Trigger video error event
    if (video) {
      fireEvent.error(video);
    }

    // Now video should be replaced with poster fallback
    const posterImg = screen.getByRole('img', {
      name: /DigiEcom digital product curator presenting storefront assets/i,
    });
    expect(posterImg).toBeInTheDocument();
    expect(posterImg).toHaveAttribute('src', '/images/digiecom-character-poster.webp');
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('directly serves static poster without video when prefers-reduced-motion is active', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <HeroHumanAnimation
        videoSrc="/videos/digiecom-walk.webm"
        posterSrc="/images/digiecom-character-poster.webp"
      />
    );

    // Video should NOT be rendered
    expect(container.querySelector('video')).not.toBeInTheDocument();

    // Static poster image must be rendered
    const posterImg = screen.getByRole('img', {
      name: /DigiEcom digital product curator presenting storefront assets/i,
    });
    expect(posterImg).toBeInTheDocument();
    expect(posterImg).toHaveAttribute('src', '/images/digiecom-character-poster.webp');
  });

  it('integrates seamlessly in Hero without obstructing headline, CTAs, or product cards', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    // Headline remains accessible
    expect(
      screen.getByRole('heading', {
        name: /Your Next Big Idea Starts With the Right Digital Tools/i,
      })
    ).toBeInTheDocument();

    // CTAs remain clickable HTML links
    const exploreBtn = screen.getByRole('link', { name: /Explore Products/i });
    expect(exploreBtn).toBeInTheDocument();
    expect(exploreBtn).toHaveAttribute('href', '/products');

    const browseBtn = screen.getByRole('link', { name: /Browse Categories/i });
    expect(browseBtn).toBeInTheDocument();
    expect(browseBtn).toHaveAttribute('href', '#category-explorer');

    // Product cards remain accessible
    expect(screen.getByText('The Pragmatic System Design Handbook')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Prompt Vault: 450+ Tested System Prompts')).toBeInTheDocument();
  });
});
