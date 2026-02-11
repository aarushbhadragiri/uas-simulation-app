import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// Fade In animation wrapper
export function FadeIn({ children, className, delay = 0, duration = 500, direction = 'up' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const directions = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: ''
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directions[direction]}`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Stagger children animation
export function StaggerChildren({ children, className, staggerDelay = 100 }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay} key={index}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

// Scale on hover
export function ScaleOnHover({ children, className, scale = 1.05 }) {
  return (
    <div
      className={cn('transition-transform duration-300 ease-out', className)}
      style={{ '--hover-scale': scale }}
      onMouseEnter={(e) => e.currentTarget.style.transform = `scale(${scale})`}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </div>
  );
}

// Blur card with glass effect
export function BlurCard({ children, className, blur = 'md' }) {
  const blurValues = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl'
  };

  return (
    <div
      className={cn(
        'bg-background/60 border border-border/50 rounded-xl shadow-2xl',
        blurValues[blur],
        className
      )}
    >
      {children}
    </div>
  );
}

// Animated counter
export function AnimatedCounter({ value, duration = 2000, className }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = parseFloat(value) || 0;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={countRef} className={className}>
      {typeof value === 'string' && value.includes('%')
        ? `${count.toFixed(1)}%`
        : count.toFixed(value.toString().includes('.') ? 1 : 0)}
    </span>
  );
}

// Pulse animation
export function Pulse({ children, className }) {
  return (
    <div className={cn('animate-pulse-slow', className)}>
      {children}
    </div>
  );
}

// Floating animation
export function Float({ children, className, amplitude = 10, duration = 3 }) {
  return (
    <div
      className={cn('animate-float', className)}
      style={{
        '--float-amplitude': `${amplitude}px`,
        '--float-duration': `${duration}s`
      }}
    >
      {children}
    </div>
  );
}

// Glow effect
export function Glow({ children, className, color = 'stone' }) {
  const glowColors = {
    stone: 'shadow-stone-500/20',
    primary: 'shadow-primary/20'
  };

  return (
    <div className={cn('transition-shadow duration-300 hover:shadow-xl', glowColors[color], className)}>
      {children}
    </div>
  );
}

// Text reveal animation
export function TextReveal({ text, className, delay = 0 }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className={cn('inline-block overflow-hidden', className)}>
      <span
        className={cn(
          'inline-block transition-transform duration-700 ease-out',
          revealed ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {text}
      </span>
    </span>
  );
}

// Shimmer effect for loading states
export function Shimmer({ className }) {
  return (
    <div className={cn('relative overflow-hidden bg-muted rounded', className)}>
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
}
