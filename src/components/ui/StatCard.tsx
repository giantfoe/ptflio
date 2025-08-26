'use client';

import React from 'react';
import { Star, GitFork, Eye, AlertCircle, Calendar, Code, Package } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: 'star' | 'fork' | 'eye' | 'issue' | 'calendar' | 'code' | 'package';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  star: Star,
  fork: GitFork,
  eye: Eye,
  issue: AlertCircle,
  calendar: Calendar,
  code: Code,
  package: Package
};

const formatValue = (value: string | number): string => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
  return value;
};

const getTrendColor = (trend?: 'up' | 'down' | 'neutral'): string => {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'neutral':
    default:
      return 'text-gray-600';
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'p-3',
        icon: 'w-4 h-4',
        value: 'text-lg font-semibold',
        label: 'text-xs',
        subtitle: 'text-xs'
      };
    case 'lg':
      return {
        container: 'p-6',
        icon: 'w-8 h-8',
        value: 'text-3xl font-bold',
        label: 'text-base',
        subtitle: 'text-sm'
      };
    case 'md':
    default:
      return {
        container: 'p-4',
        icon: 'w-6 h-6',
        value: 'text-2xl font-bold',
        label: 'text-sm',
        subtitle: 'text-sm'
      };
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  subtitle,
  className = '',
  size = 'md'
}) => {
  const IconComponent = icon ? iconMap[icon] : null;
  const sizeClasses = getSizeClasses(size);
  const trendColor = getTrendColor(trend);
  
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm
        hover:shadow-md transition-shadow duration-200
        ${sizeClasses.container}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {IconComponent && (
              <IconComponent 
                className={`${sizeClasses.icon} text-gray-500 dark:text-gray-400`} 
              />
            )}
            <span className={`${sizeClasses.label} font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide`}>
              {label}
            </span>
          </div>
          
          <div className={`${sizeClasses.value} text-gray-900 dark:text-white ${trendColor}`}>
            {formatValue(value)}
          </div>
          
          {subtitle && (
            <p className={`${sizeClasses.subtitle} text-gray-500 dark:text-gray-400 mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {trend && trend !== 'neutral' && (
          <div className={`flex items-center ${trendColor}`}>
            <span className="text-xs font-medium">
              {trend === 'up' ? '↗' : '↘'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;