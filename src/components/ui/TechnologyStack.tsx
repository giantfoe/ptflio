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
      <div className={className}>
        <h3 className="text-lg font-semibold text-white mb-4">
          Technology Stack
        </h3>
        <p className="text-gray-300 text-center py-8">
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
      <div className={className}>
        <h3 className="text-lg font-semibold text-white mb-4">
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
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Technology Stack
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span>{totalLanguages} languages</span>
          <span>•</span>
          <span>{formattedSize}</span>
          <span>•</span>
          <span>~{(isNaN(estimatedLOC) ? 0 : estimatedLOC).toLocaleString()} LOC</span>
        </div>
      </div>
      
      {/* Primary Technology Highlight */}
      {primaryTech && (
        <div className="mb-6 p-4 backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-xl">
          <div className="flex items-center gap-3">
            {primaryTech.icon && (
              <primaryTech.icon.icon className="w-6 h-6" />
            )}
            <div>
              <h4 className="font-semibold text-white">
                Primary Language: {primaryTech.name}
              </h4>
              <p className="text-sm text-gray-300">
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
              <group.icon className="w-5 h-5" />
              <h4 className="font-medium text-white">
                {group.name}
              </h4>
              <span className="text-sm text-gray-300">
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
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-xl">
            <div className="text-lg font-semibold text-white">
              {totalLanguages}
            </div>
            <div className="text-xs text-gray-300">
              Languages
            </div>
          </div>
          
          <div className="p-3 backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-xl">
            <div className="text-lg font-semibold text-white">
              {formattedSize}
            </div>
            <div className="text-xs text-gray-300">
              Repository Size
            </div>
          </div>
          
          <div className="p-3 backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-xl">
            <div className="text-lg font-semibold text-white">
              ~{(isNaN(estimatedLOC) ? 0 : estimatedLOC).toLocaleString()}
            </div>
            <div className="text-xs text-gray-300">
              Lines of Code
            </div>
          </div>
          
          <div className="p-3 backdrop-blur-md bg-white/10 rounded-lg border border-white/20 shadow-xl">
            <div className="text-lg font-semibold text-white">
              {groups.length}
            </div>
            <div className="text-xs text-gray-300">
              Tech Categories
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyStack;