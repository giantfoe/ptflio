'use client';

import React from 'react';
import { getTechnologyIcon } from '@/utils/technologyGrouping';

interface TechnologyBadgeProps {
  name: string;
  percentage?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled' | 'progress';
  showPercentage?: boolean;
  showIcon?: boolean;
  showProgressBar?: boolean;
  className?: string;
}

const getTechnologyColor = (tech: string): string => {
  const techColors: Record<string, string> = {
    // Frontend
    'JavaScript': 'bg-yellow-500',
    'TypeScript': 'bg-blue-600',
    'React': 'bg-cyan-500',
    'Vue': 'bg-green-500',
    'Angular': 'bg-red-600',
    'Svelte': 'bg-orange-500',
    'HTML': 'bg-orange-600',
    'CSS': 'bg-blue-500',
    'SCSS': 'bg-pink-500',
    'Sass': 'bg-pink-500',
    'Tailwind': 'bg-teal-500',
    
    // Backend
    'Node.js': 'bg-green-600',
    'Python': 'bg-blue-500',
    'Java': 'bg-red-500',
    'Go': 'bg-cyan-600',
    'Rust': 'bg-orange-700',
    'PHP': 'bg-purple-600',
    'C#': 'bg-purple-700',
    'Ruby': 'bg-red-700',
    
    // Databases
    'MongoDB': 'bg-green-700',
    'PostgreSQL': 'bg-blue-700',
    'MySQL': 'bg-orange-600',
    'Redis': 'bg-red-600',
    'SQLite': 'bg-gray-600',
    
    // Tools & Frameworks
    'Docker': 'bg-blue-600',
    'Kubernetes': 'bg-blue-700',
    'AWS': 'bg-orange-500',
    'Firebase': 'bg-yellow-600',
    'Supabase': 'bg-green-600',
    'Vercel': 'bg-black',
    'Netlify': 'bg-teal-600',
    
    // Default
    'default': 'bg-gray-500'
  };
  
  return techColors[tech] || techColors['default'];
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

const progressSizeClasses = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2'
};

export const TechnologyBadge: React.FC<TechnologyBadgeProps> = ({
  name,
  percentage,
  size = 'md',
  variant = 'default',
  showPercentage = false,
  showIcon = true,
  showProgressBar = false,
  className = ''
}) => {
  // Ensure percentage is a valid number
  const validPercentage = percentage !== undefined && !isNaN(percentage) && isFinite(percentage) ? percentage : 0;
  
  const colorClass = getTechnologyColor(name);
  const sizeClass = sizeClasses[size];
  const progressSizeClass = progressSizeClasses[size];
  const techIcon = getTechnologyIcon(name);
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return `border-2 border-current text-current bg-transparent ${colorClass.replace('bg-', 'border-').replace('bg-', 'text-')}`;
      case 'filled':
        return `${colorClass} text-white`;
      case 'progress':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700';
      default:
        return `${colorClass} text-white`;
    }
  };
  
  const displayText = showPercentage && percentage !== undefined 
    ? `${name} ${validPercentage}%`
    : name;
  
  // Progress bar variant
  if (variant === 'progress' && showProgressBar && percentage !== undefined) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {showIcon && techIcon && (
              <span className="text-lg" title={techIcon.name}>
                {techIcon.icon}
              </span>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {name}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {validPercentage}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${progressSizeClass}`}>
          <div 
            className={`${progressSizeClass} rounded-full transition-all duration-500 ease-out ${colorClass}`}
            style={{ width: `${Math.max(0, Math.min(100, validPercentage))}%` }}
          />
        </div>
      </div>
    );
  }
  
  // Regular badge variant
  return (
    <span 
      className={`
        inline-flex items-center justify-center gap-1.5
        rounded-full font-medium
        transition-all duration-200
        hover:scale-105 hover:shadow-md
        ${sizeClass}
        ${getVariantClasses()}
        ${className}
      `}
      title={showPercentage && percentage !== undefined ? `${name}: ${validPercentage}%` : name}
    >
      {showIcon && techIcon && (
        <span className="text-sm" title={techIcon.name}>
          {techIcon.icon}
        </span>
      )}
      <span>{displayText}</span>
      {showPercentage && percentage !== undefined && !showProgressBar && (
        <div 
          className="w-2 h-2 rounded-full bg-white/30"
          style={{
            width: `${Math.max(8, validPercentage / 5)}px`,
            height: `${Math.max(8, validPercentage / 5)}px`
          }}
        />
      )}
    </span>
  );
};

export default TechnologyBadge;