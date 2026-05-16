'use client';

import { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  delay?: 0 | 1 | 2 | 3;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
}

/**
 * Wraps children with intersection-observer driven fade-in.
 * Adds .scroll-fade-in (and optionally .delay-N) classes, then toggles
 * .is-visible when the element enters viewport.
 */
export default function ScrollFadeIn({ children, delay = 0, className = '', as = 'div' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const obs = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delayClass = delay ? ` delay-${delay}` : '';
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref}
      className={`scroll-fade-in${delayClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
