'use client';

import React from 'react';
import useSWR from 'swr';
import { useRSCNavigation } from '@/hooks/useRSCNavigation';
import { TechnologyBadge } from '@/components/ui/TechnologyBadge';
import { AbstractProjectImage } from '@/components/ui/AbstractProjectImage';
import { ExternalLink, Globe } from 'lucide-react';

interface Project {
  name: string;
  description: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  summary?: {
    description: string;
    functionality: string;
    liveLink?: string;
    live_links?: string[];
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function Projects() {
  const { data, error, isLoading } = useSWR<{ items: Project[] }>('/api/github', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
  });
  const { navigate, state: navState } = useRSCNavigation();

  if (isLoading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.items?.length) return <p>No projects available</p>;

  return (
    <section id="projects" className="min-h-[100svh] py-24 bg-[color-mix(in_oklab,black,white_5%)]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-8 text-white">Projects</h2>
        <p className="text-neutral-300 mb-6">Explore my GitHub repositories showcasing various projects and contributions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((project) => {
            const hasDeployment = project.summary?.live_links && project.summary.live_links.length > 0;
            const primaryLiveLink = hasDeployment ? project.summary!.live_links![0] : null;
            
            return (
              <div 
                key={project.name}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/30 transition relative"
                style={{
                  opacity: navState.isNavigating ? 0.7 : 1,
                  pointerEvents: navState.isNavigating ? 'none' : 'auto'
                }}
              >
                {/* Deployment Status Badge */}
                {hasDeployment && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                      <Globe className="w-3 h-3" />
                      <span>Live</span>
                    </div>
                  </div>
                )}
                
                <article>
                  {/* Project Preview Thumbnail */}
                  <AbstractProjectImage
                    projectName={project.name}
                    className="h-40 rounded-md mb-4 cursor-pointer group/preview"
                    onClick={() => navigate(`/projects/${project.name}`)}
                  >
                    {hasDeployment && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                          Preview Available
                        </div>
                      </div>
                    )}
                  </AbstractProjectImage>
                  
                  <div onClick={() => navigate(`/projects/${project.name}`)} className="cursor-pointer">
                    <h3 className="text-lg font-medium text-white">{project.name}</h3>
                    <p className="text-sm text-neutral-300 mt-1">{project.summary?.description || project.description}</p>
                  </div>
                  
                  {/* Technology Stack */}
                  {project.language && (
                    <div className="mt-3 mb-2">
                      <TechnologyBadge 
                        name={project.language} 
                        size="sm" 
                        variant="filled"
                        showIcon={true}
                      />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => navigate(`/projects/${project.name}`)}
                      className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                    >
                      {navState.isNavigating ? 'Loading...' : 'View Details →'}
                    </button>
                    
                    {hasDeployment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (primaryLiveLink) {
                            window.open(primaryLiveLink, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live Demo</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Multiple Links Indicator */}
                  {hasDeployment && project.summary!.live_links!.length > 1 && (
                    <div className="mt-2 text-xs text-neutral-400">
                      +{project.summary!.live_links!.length - 1} more deployment{project.summary!.live_links!.length > 2 ? 's' : ''}
                    </div>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}