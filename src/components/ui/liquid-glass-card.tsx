import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { getFocusStyles, getAccessibleAnimationClasses } from '@/utils/accessibility';

const liquidGlassCardVariants = cva(
  'relative overflow-hidden rounded-xl transition-all duration-500 ease-out group',
  {
    variants: {
      variant: {
        default: 'bg-white/[0.08] border border-white/[0.12] backdrop-blur-md hover:bg-white/[0.12] hover:border-white/[0.18] text-white',
        strong: 'bg-white/[0.15] border border-white/[0.20] backdrop-blur-lg hover:bg-white/[0.20] hover:border-white/[0.25] text-white',
        subtle: 'bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12] text-white/90',
        accent: 'bg-gradient-to-br from-blue-500/[0.15] to-purple-500/[0.15] border border-white/[0.15] backdrop-blur-md hover:from-blue-500/[0.20] hover:to-purple-500/[0.20] text-white',
        liquid: 'bg-gradient-to-br from-white/[0.10] via-white/[0.05] to-white/[0.08] border border-white/[0.15] backdrop-blur-md hover:from-white/[0.15] hover:via-white/[0.08] hover:to-white/[0.12] text-white',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
      },
      glow: {
        none: '',
        subtle: 'shadow-lg shadow-blue-500/10',
        strong: 'shadow-xl shadow-blue-500/20',
        liquid: 'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
      },
      animation: {
        none: '',
        hover: 'hover:scale-[1.02] hover:-translate-y-1',
        float: 'hover:scale-[1.02] hover:-translate-y-2',
        morph: 'hover:scale-[1.03] hover:rotate-1',
      },
      focusable: {
        true: 'cursor-pointer',
        false: ''
      },
    },
    defaultVariants: {
      variant: 'liquid',
      size: 'md',
      glow: 'liquid',
      animation: 'hover',
    },
  }
);

export interface LiquidGlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof liquidGlassCardVariants> {
  children: React.ReactNode;
  shimmer?: boolean;
  ripple?: boolean;
  focusable?: boolean;
  'aria-label'?: string;
}

const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow, 
    animation, 
    children, 
    shimmer = true, 
    ripple = false, 
    focusable = false,
    ...props 
  }, ref) => {
    const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; id: number } | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setRippleEffect({ x, y, id: Date.now() });
        
        setTimeout(() => setRippleEffect(null), 600);
      }
      
      if (props.onClick) {
        props.onClick(e);
      }
    };

    const animationClasses = getAccessibleAnimationClasses(
      liquidGlassCardVariants({ variant, size, glow, animation, focusable }),
      'transition-colors duration-200'
    );
    
    const focusClasses = focusable ? getFocusStyles('medium') : '';

    return (
      <div
        className={cn(
          animationClasses,
          focusClasses,
          className
        )}
        ref={ref}
        onClick={handleClick}
        tabIndex={focusable ? 0 : undefined}
        role={focusable ? 'button' : undefined}
        onKeyDown={focusable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Trigger click event for keyboard activation
            if (props.onClick) {
              const rect = e.currentTarget.getBoundingClientRect();
              const syntheticEvent = {
                currentTarget: e.currentTarget,
                target: e.target,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2,
                preventDefault: () => {},
                stopPropagation: () => {}
              } as React.MouseEvent<HTMLDivElement>;
              props.onClick(syntheticEvent);
            }
          }
        } : undefined}
        {...props}
      >
        {/* Glass Reflection Layer */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          {/* Primary Glass Reflection */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.15] via-white/[0.05] to-transparent opacity-60" />
          
          {/* Secondary Reflection */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.08] to-transparent opacity-40" />
          
          {/* Corner Highlight */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/[0.20] to-transparent rounded-full blur-sm" />
        </div>

        {/* Shimmer Effect */}
        {shimmer && (
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-r from-transparent via-white/[0.15] to-transparent transform rotate-45 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000 ease-out" />
          </div>
        )}

        {/* Border Highlight */}
        <div className="absolute inset-0 rounded-xl border border-white/[0.05] group-hover:border-white/[0.10] transition-colors duration-300 pointer-events-none" />

        {/* Inner Shadow for Depth */}
        <div className="absolute inset-0 rounded-xl shadow-inner shadow-black/[0.10] pointer-events-none" />

        {/* Ripple Effect */}
        {ripple && rippleEffect && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: rippleEffect.x - 50,
              top: rippleEffect.y - 50,
              width: 100,
              height: 100,
            }}
          >
            <div className="w-full h-full rounded-full bg-white/[0.20] animate-ping" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        </div>
      </div>
    );
  }
);

LiquidGlassCard.displayName = 'LiquidGlassCard';

export { LiquidGlassCard, liquidGlassCardVariants };