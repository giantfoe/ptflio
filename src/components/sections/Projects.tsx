'use client';

import React from 'react';
import useSWR from 'swr';
import { Parallax } from 'react-scroll-parallax';
import { useRSCNavigation } from '@/hooks/useRSCNavigation';
import { TechnologyBadge } from '@/components/ui/TechnologyBadge';
import { AbstractProjectImage } from '@/components/ui/AbstractProjectImage';
import { SectionHeader } from '@/components/ui/section-header';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button';
import { LiquidGlassEffects } from '@/components/ui/liquid-glass-effects';
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
    <section id="projects" className="min-h-[100svh] py-16 px-6 relative overflow-hidden" style={{ backgroundImage: 'url(/3.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Floating Elements with Parallax - Similar to Hero */}
      <Parallax speed={-8} className="absolute top-20 left-10 opacity-30">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl" />
      </Parallax>
      <Parallax speed={-12} className="absolute top-40 right-20 opacity-20">
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-2xl" />
      </Parallax>
      <Parallax speed={-6} className="absolute bottom-20 left-1/4 opacity-25">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-lg" />
      </Parallax>
      <Parallax speed={-10} className="absolute top-1/2 right-1/3 opacity-15">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 blur-xl" />
      </Parallax>

      {/* Gradient Overlay for text readability - Similar to Hero */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      
      <div className="container-width relative z-10">
        {/* Section Header with Parallax */}
        <Parallax speed={-15}>
          <SectionHeader
            title="Featured Projects"
            subtitle="Explore my GitHub repositories showcasing various projects and contributions with live deployments and detailed documentation."
            size="lg"
            titleGradient="accent"
            className="drop-shadow-2xl"
          />
        </Parallax>
        
        {/* Project Cards with Parallax */}
        <Parallax speed={5}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {data.items.map((project) => {
            const hasDeployment = project.summary?.live_links && project.summary.live_links.length > 0;
            const primaryLiveLink = hasDeployment ? project.summary!.live_links![0] : null;
            
            return (
              <LiquidGlassCard 
                key={project.name}
                variant="liquid"
                size="lg"
                glow="liquid"
                animation="float"
                className="group relative overflow-hidden"
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
                  <div className="flex items-center gap-3 mt-6">
                    <LiquidGlassButton
                      variant="secondary"
                      size="sm"
                      animation="morph"
                      onClick={() => navigate(`/projects/${project.name}`)}
                      className="flex-1"
                      ripple={true}
                      shimmer={true}
                    >
                      {navState.isNavigating ? 'Loading...' : 'View Details'}
                    </LiquidGlassButton>
                    
                    {hasDeployment && (
                      <LiquidGlassButton
                        variant="primary"
                        size="sm"
                        animation="liquid"
                        glow="liquid"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (primaryLiveLink) {
                            window.open(primaryLiveLink, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex items-center gap-2"
                        ripple={true}
                        shimmer={true}
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </span>
                      </LiquidGlassButton>
                    )}
                  </div>
                  
                  {/* Multiple Links Indicator */}
                  {hasDeployment && project.summary!.live_links!.length > 1 && (
                    <div className="mt-2 text-xs text-neutral-400">
                      +{project.summary!.live_links!.length - 1} more deployment{project.summary!.live_links!.length > 2 ? 's' : ''}
                    </div>
                  )}
                </article>
              </LiquidGlassCard>
            );
          })}
          </div>
        </Parallax>
      </div>
    </section>
  );
}