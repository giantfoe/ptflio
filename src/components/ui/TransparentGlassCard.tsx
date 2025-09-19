'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TransparentGlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  id?: string;
}

export const TransparentGlassCard: React.FC<TransparentGlassCardProps> = ({
  children,
  className,
  onClick,
  style,
  id,
}) => {
  return (
    <div
      id={id}
      className={cn(
        // Minimal glass structure
        'relative overflow-hidden rounded-xl',
        
        // Authentic liquid glass properties
        'backdrop-blur-[2px]',
        'bg-white/[0.02]',
        'border border-white/[0.08]',
        
        // Subtle glass depth
        'shadow-[0_4px_16px_rgba(0,0,0,0.1)]',
        
        // Gentle transitions
        'transition-all duration-300 ease-out',
        
        // Minimal hover interaction
        'hover:backdrop-blur-[4px]',
        'hover:bg-white/[0.04]',
        'hover:border-white/[0.12]',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]',
        
        // Interactive cursor
        onClick && 'cursor-pointer',
        
        className
      )}
      onClick={onClick}
      style={style}
    >
      {/* Single subtle highlight */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Content container */}
      <div className="relative p-6">
        {children}
      </div>
    </div>
  );
};

export default TransparentGlassCard;