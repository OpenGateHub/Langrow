'use client';

import { useInView } from '@/hooks/useInView';
import { ReactNode } from 'react';

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimateOnScroll({ children, className = '', delay = 0 }: AnimateOnScrollProps) {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`${className} opacity-0 translate-y-4 ${
        isInView ? 'animate-fade-in' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
} 