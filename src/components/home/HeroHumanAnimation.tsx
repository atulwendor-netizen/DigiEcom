import React, { useState, useEffect, useRef } from 'react';

export interface HeroHumanAnimationProps {
  videoSrc?: string;
  posterSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  onEnded?: () => void;
  altText?: string;
}

/**
 * HeroHumanAnimation
 *
 * Renders an accessible, non-blocking photorealistic human presenter animation.
 * Features:
 * - Plays inline, muted, autoplay with no audio track
 * - Plays once and freezes on the final frame (no indefinite looping)
 * - Automatic fallback to static poster on video load/playback failure
 * - Respects prefers-reduced-motion by serving the static poster image immediately
 * - Lightweight mobile optimization serving static poster below 768px
 * - pointer-events: none ensures CTAs, links, and navigation are never blocked
 * - Soft edge blending to prevent harsh rectangular borders if video lacks alpha
 */
export const HeroHumanAnimation: React.FC<HeroHumanAnimationProps> = ({
  videoSrc = '/videos/digiecom-walk.webm',
  posterSrc = '/images/digiecom-character-poster.webp',
  className = '',
  style,
  onEnded,
  altText = 'DigiEcom digital product curator presenting storefront assets',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Check prefers-reduced-motion and screen width on mount & resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mediaQuery: MediaQueryList | null = null;
    let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null;

    if (typeof window.matchMedia === 'function') {
      mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);

      handleMotionChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMotionChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleMotionChange);
      }
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      if (mediaQuery && handleMotionChange) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMotionChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleMotionChange);
        }
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleEnded = () => {
    if (videoRef.current) {
      // Hold on the final frame
      videoRef.current.pause();
    }
    if (onEnded) {
      onEnded();
    }
  };

  const handleVideoError = () => {
    // If the video file is missing (404) or fails to decode, gracefully fall back to poster
    setHasError(true);
  };

  const shouldRenderVideo = !isReducedMotion && !isMobile && !hasError;

  return (
    <div
      className={`hero-human-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        ...style,
      }}
      aria-label={altText}
    >
      {/* Ambient pedestal glow behind the presenter */}
      <div
        className="hero-human-pedestal-glow"
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '40%',
          background: 'radial-gradient(ellipse at bottom, rgba(16, 239, 138, 0.18) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 75%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Video Player */}
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          className="hero-human-video"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          playsInline
          loop={false}
          preload="auto"
          onEnded={handleEnded}
          onError={handleVideoError}
          onLoadedData={() => setVideoLoaded(true)}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '380px',
            height: 'auto',
            maxHeight: '480px',
            objectFit: 'contain',
            pointerEvents: 'none',
            opacity: videoLoaded ? 1 : 0.9,
            transition: 'opacity var(--duration-base) var(--ease-out-smooth)',
            filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.65))',
          }}
          aria-hidden="true"
        />
      ) : (
        /* Static Poster Fallback (used when reduced motion is preferred, on mobile, or when video is absent/fails) */
        <div
          className="hero-human-poster-wrapper"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '340px',
            width: '100%',
            pointerEvents: 'none',
          }}
        >
          <img
            src={posterSrc}
            alt={altText}
            className="hero-human-poster"
            loading="eager"
            decoding="async"
            onError={() => {
              // Both video and poster missing or unavailable: hide image without throwing
            }}
            style={{
              width: '100%',
              maxHeight: isMobile ? '280px' : '440px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-lg)',
              filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.65))',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};
