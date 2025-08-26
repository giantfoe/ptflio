'use client';

import React from 'react';
import { ExternalLink, Github, Calendar, User, Tag } from 'lucide-react';
import { StatCard } from './StatCard';
import { TechnologyBadge } from './TechnologyBadge';
import { TechnologyStack } from './TechnologyStack';
import { AIGeneratedDescription } from '@/utils/aiDescriptionGenerator';

interface ProjectHeaderProps {
  name: string;
  description: string;
  aiDescription?: AIGeneratedDescription | null;
  homepage?: string;
  githubUrl: string;
  stats: {
    stars: number;
    forks: number;
    watchers: number;
    issues: number;
    size: number;
  };
  languages: Record<string, number>;
  topics: string[];
  license?: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
  className?: string;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  name,
  description,
  aiDescription,
  homepage,
  githubUrl,
  stats,
  languages,
  topics,
  license,
  createdAt,
  updatedAt,
  owner,
  className = ''
}) => {
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Github className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {name}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            {description}
          </p>
          
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
            
            {homepage && (
              <a
                href={homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                <ExternalLink className="w-5 h-5" />
                Live Demo
              </a>
            )}
          </div>
        </div>
        
        {/* AI-generated description */}
        {aiDescription && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Overview
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {aiDescription.summary}
              </p>
              
              {aiDescription.technologies.length > 0 && (
                 <div>
                   <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                     Key Technologies
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {aiDescription.technologies.map((tech, index) => (
                       <span
                         key={index}
                         className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm"
                       >
                         {tech}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
               
               {aiDescription.keyFeatures.length > 0 && (
                 <div>
                   <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                     Key Features
                   </h3>
                   <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                     {aiDescription.keyFeatures.map((feature, index) => (
                       <li key={index}>{feature}</li>
                     ))}
                   </ul>
                 </div>
               )}
              
              {aiDescription.useCases.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Use Cases
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {aiDescription.useCases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Stars"
            value={stats.stars}
            icon="star"
            size="sm"
          />
          <StatCard
            label="Forks"
            value={stats.forks}
            icon="fork"
            size="sm"
          />
          <StatCard
            label="Watchers"
            value={stats.watchers}
            icon="eye"
            size="sm"
          />
          <StatCard
            label="Issues"
            value={stats.issues}
            icon="issue"
            size="sm"
          />
        </div>
        
        {/* Technology stack */}
        <TechnologyStack 
          languages={languages}
          repositorySize={stats.size}
          variant="detailed"
        />
        
        {/* Topics and metadata */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Topics */}
          {topics.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Project metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Owner:</span>
                <span className="font-medium text-gray-900 dark:text-white">{owner}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Updated:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(updatedAt)}</span>
              </div>
              
              {license && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-300">License:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{license}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">Size:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatSize(stats.size * 1024)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;