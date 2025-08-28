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
    <div className={`relative z-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main header */}
        <div className="text-center mb-8">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Github className="w-8 h-8 text-white" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {name}
              </h1>
            </div>
            
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-6">
              {description}
            </p>
            
            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-sm bg-white/20 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
              
              {homepage && (
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-sm bg-blue-500/30 border border-blue-400/50 text-white rounded-xl font-semibold hover:bg-blue-500/40 hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* AI-generated description */}
        {aiDescription && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 mb-8 hover:bg-white/15 transition-all duration-300">
            <h2 className="text-lg font-semibold text-white mb-4">
              Project Overview
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {aiDescription.summary}
              </p>
              
              {aiDescription.technologies.length > 0 && (
                 <div>
                   <h3 className="text-md font-medium text-white mb-2">
                     Key Technologies
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {aiDescription.technologies.map((tech, index) => (
                       <span
                         key={index}
                         className="px-3 py-1 backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 rounded-lg text-sm hover:bg-green-500/30 transition-all duration-200"
                       >
                         {tech}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
               
               {aiDescription.keyFeatures.length > 0 && (
                 <div>
                   <h3 className="text-md font-medium text-white mb-2">
                     Key Features
                   </h3>
                   <ul className="list-disc list-inside text-gray-200 space-y-1">
                     {aiDescription.keyFeatures.map((feature, index) => (
                       <li key={index}>{feature}</li>
                     ))}
                   </ul>
                 </div>
               )}
              
              {aiDescription.useCases.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-white mb-2">
                    Use Cases
                  </h3>
                  <ul className="list-disc list-inside text-gray-200 space-y-1">
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
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <StatCard
              label="Stars"
              value={stats.stars}
              icon="star"
              size="sm"
            />
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <StatCard
              label="Forks"
              value={stats.forks}
              icon="fork"
              size="sm"
            />
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <StatCard
              label="Watchers"
              value={stats.watchers}
              icon="eye"
              size="sm"
            />
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-4 hover:bg-white/15 transition-all duration-300">
            <StatCard
              label="Issues"
              value={stats.issues}
              icon="issue"
              size="sm"
            />
          </div>
        </div>
        
        {/* Technology stack */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 mb-8 hover:bg-white/15 transition-all duration-300">
          <TechnologyStack 
            languages={languages}
            repositorySize={stats.size}
            variant="detailed"
          />
        </div>
        
        {/* Topics and metadata */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Topics */}
          {topics.length > 0 && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all duration-300">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-200 rounded-full text-sm font-medium hover:bg-blue-500/30 transition-all duration-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Project metadata */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">
              Project Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-300" />
                <span className="text-gray-200">Owner:</span>
                <span className="font-medium text-white">{owner}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-300" />
                <span className="text-gray-200">Created:</span>
                <span className="font-medium text-white">{formatDate(createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-300" />
                <span className="text-gray-200">Updated:</span>
                <span className="font-medium text-white">{formatDate(updatedAt)}</span>
              </div>
              
              {license && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-200">License:</span>
                  <span className="font-medium text-white">{license}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-200">Size:</span>
                <span className="font-medium text-white">{formatSize(stats.size * 1024)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;