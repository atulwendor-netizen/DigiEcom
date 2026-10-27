import React from 'react';
import { useInView } from '../../hooks/useInView';

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'section' | 'article' | 'li';
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  delay = 0,
  className = '',
  style = {},
  as = 'div',
}) => {
  const [ref, isVisible] = useInView<HTMLElement>({ threshold: 0.12 });

  const Component = as as React.ElementType;

  return (
    <Component
      ref={ref}
      className={`reveal-fade-up ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{
        ...style,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </Component>
  );
};
