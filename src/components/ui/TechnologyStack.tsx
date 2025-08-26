'use client';

import React from 'react';
import { TechnologyBadge } from './TechnologyBadge';
import { 
  groupTechnologies, 
  getPrimaryTechnology, 
  formatRepositorySize, 
  estimateLinesOfCode,
  type TechnologyGroup 
} from '@/utils/technologyGrouping';
import { Code, Database, Layers, Zap } from 'lucide-react';

interface TechnologyStackProps {
  languages: Record<string, number>;
  repositorySize: number; // in KB
  className?: string;
  variant?: 'compact' | 'detailed';
}

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'frontend':
      return <Layers className="w-4 h-4" />;
    case 'backend':
      return <Code className="w-4 h-4" />;
    case 'database':
      return <Database className="w-4 h-4" />;
    default:
      return <Zap className="w-4 h-4" />;
  }
};

export const TechnologyStack: React.FC<TechnologyStackProps> = ({
  languages,
  repositorySize,
  className = '',
  variant = 'detailed'
}) => {
  // Ensure languages is a valid object with numeric values
  const validLanguages = languages && typeof languages === 'object' ? languages : {};
  const hasValidData = Object.keys(validLanguages).length > 0 && 
    Object.values(validLanguages).some(bytes => typeof bytes === 'number' && bytes > 0);
  
  const groups = hasValidData ? groupTechnologies(validLanguages) : [];
  const primaryTech = hasValidData ? getPrimaryTechnology(validLanguages) : null;
  const totalLanguages = hasValidData ? Object.keys(validLanguages).length : 0;
  const estimatedLOC = hasValidData ? estimateLinesOfCode(validLanguages) : 0;
  const formattedSize = repositorySize && repositorySize > 0 ? formatRepositorySize(repositorySize) : '0 KB';
  
  if (!hasValidData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Technology Stack
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No language data available
        </p>
      </div>
    );
  }
  
  if (variant === 'compact') {
    const topLanguages = Object.entries(validLanguages)
      .filter(([, bytes]) => typeof bytes === 'number' && bytes > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    const totalBytes = Object.values(validLanguages).reduce((sum, bytes) => sum + (typeof bytes === 'number' ? bytes : 0), 0);
    
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Technology Stack
        </h3>
        <div className="flex flex-wrap gap-2">
          {topLanguages.map(([language, bytes]) => {
            const percentage = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;
            return (
              <TechnologyBadge
                key={language}
                name={language}
                percentage={isNaN(percentage) ? 0 : percentage}
                showPercentage={true}
                showIcon={true}
                size="md"
              />
            );
          })}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Technology Stack
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{totalLanguages} languages</span>
          <span>•</span>
          <span>{formattedSize}</span>
          <span>•</span>
          <span>~{(isNaN(estimatedLOC) ? 0 : estimatedLOC).toLocaleString()} LOC</span>
        </div>
      </div>
      
      {/* Primary Technology Highlight */}
      {primaryTech && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            {primaryTech.icon && (
              <span className="text-2xl" title={primaryTech.icon.name}>
                {primaryTech.icon.icon}
              </span>
            )}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Primary Language: {primaryTech.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isNaN(primaryTech.percentage) ? 0 : primaryTech.percentage}% of codebase
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Technology Groups */}
      <div className="space-y-6">
        {groups.map((group: TechnologyGroup) => (
          <div key={group.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{group.icon}</span>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {group.name}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({isNaN(group.totalPercentage) ? 0 : group.totalPercentage}%)
              </span>
            </div>
            
            <div className="grid gap-3">
              {group.technologies.map((tech) => (
                <TechnologyBadge
                  key={tech.name}
                  name={tech.name}
                  percentage={isNaN(tech.percentage) ? 0 : tech.percentage}
                  variant="progress"
                  showPercentage={true}
                  showIcon={true}
                  showProgressBar={true}
                  size="md"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalLanguages}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Languages
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formattedSize}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Repository Size
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ~{(isNaN(estimatedLOC) ? 0 : estimatedLOC).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Lines of Code
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {groups.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Tech Categories
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyStack;