import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  'backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white/10 hover:bg-white/15',
        strong: 'bg-white/20 hover:bg-white/25',
        subtle: 'bg-white/5 hover:bg-white/10',
        accent: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30',
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
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      glow: 'none',
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, glow, children, ...props }, ref) => {
    return (
      <div
        className={cn(glassCardVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard, glassCardVariants };