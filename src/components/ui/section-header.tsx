'use client';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const sectionHeaderVariants = cva(
  'text-center space-y-4 transition-all duration-1000',
  {
    variants: {
      size: {
        sm: 'mb-8 pt-8',
        md: 'mb-12 pt-12',
        lg: 'mb-16 pt-16',
      },
      alignment: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      size: 'md',
      alignment: 'center',
    },
  }
);

const titleVariants = cva(
  'font-bold tracking-tight transition-all duration-1000 transform',
  {
    variants: {
      size: {
        sm: 'text-2xl md:text-3xl',
        md: 'text-3xl md:text-4xl lg:text-5xl',
        lg: 'text-4xl md:text-5xl lg:text-6xl',
      },
      gradient: {
        none: 'text-white',
        primary: 'text-gradient bg-gradient-to-r from-white via-blue-100 to-purple-100',
        accent: 'text-gradient bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-purple',
      },
    },
    defaultVariants: {
      size: 'md',
      gradient: 'primary',
    },
  }
);

const subtitleVariants = cva(
  'text-white/70 max-w-2xl mx-auto leading-relaxed transition-all duration-1200 transform',
  {
    variants: {
      size: {
        sm: 'text-sm md:text-base',
        md: 'text-base md:text-lg',
        lg: 'text-lg md:text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  title: string;
  subtitle?: string;
  titleSize?: VariantProps<typeof titleVariants>['size'];
  titleGradient?: VariantProps<typeof titleVariants>['gradient'];
  subtitleSize?: VariantProps<typeof subtitleVariants>['size'];
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ 
    className, 
    size, 
    alignment, 
    title, 
    subtitle, 
    titleSize, 
    titleGradient, 
    subtitleSize,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const combinedRef = ref || headerRef;

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.2, rootMargin: '50px' }
      );

      const currentRef = combinedRef as React.RefObject<HTMLDivElement>;
      if (currentRef.current) {
        observer.observe(currentRef.current);
      }

      return () => observer.disconnect();
    }, [combinedRef]);

    return (
      <div
        className={cn(
          sectionHeaderVariants({ size, alignment }),
          'transition-all duration-1000 ease-out',
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8',
          className
        )}
        ref={combinedRef}
        {...props}
      >
        <h2 
          className={cn(
            titleVariants({ size: titleSize || size, gradient: titleGradient }),
            'transition-all duration-1200 ease-out delay-200',
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-6 scale-95'
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p 
            className={cn(
              subtitleVariants({ size: subtitleSize || size }),
              'transition-all duration-1000 ease-out delay-400',
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';

export { SectionHeader, sectionHeaderVariants, titleVariants, subtitleVariants };