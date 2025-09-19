'use client';

import React from 'react';
import useSWR from 'swr';
import { Parallax } from 'react-scroll-parallax';
import { useRSCNavigation } from '@/hooks/useRSCNavigation';

import { TransparentGlassCard } from '@/components/ui/TransparentGlassCard';
import { getAbstractImageUrl } from '@/utils/abstractImageGenerator';
import { SectionHeader } from '@/components/ui/section-header';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button';
import { LiquidGlassEffects } from '@/components/ui/liquid-glass-effects';
import { Globe, ExternalLink } from 'lucide-react';

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
          <div className="w-full relative flex items-center justify-center h-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full max-w-7xl">
              {data.items.map((project) => {
                const hasDeployment = project.summary?.live_links && project.summary.live_links.length > 0;
                const primaryLiveLink = hasDeployment ? project.summary!.live_links![0] : null;
                
                return (
                  <TransparentGlassCard
                    key={project.name}
                    id={`project-${project.name}`}
                    className="group transition-all duration-500 cursor-pointer"
                    onClick={() => navigate(`/projects/${project.name}`, project.name)}
                    style={{
                      opacity: navState.isNavigating ? 0.7 : 1,
                      pointerEvents: navState.isNavigating ? 'none' : 'auto'
                    }}
                  >
                    <div className="rounded-xl overflow-hidden mb-6">
                      <div className="relative">
                        <img
                          src={getAbstractImageUrl(project.name)}
                          alt={`Abstract representation of ${project.name}`}
                          className="rounded-xl w-full h-48 object-cover cursor-pointer group/preview transition-transform duration-300 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.name}`, project.name);
                          }}
                        />
                        {hasDeployment && (
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl">
                            <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                              Preview Available
                            </div>
                          </div>
                        )}
                        
                        {/* Deployment Status Badge */}
                        {hasDeployment && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/90 border border-green-500/30 rounded-full text-white text-xs font-medium shadow-lg backdrop-blur-sm">
                              <Globe className="w-3 h-3" />
                              <span>Live</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <h4 className="font-manrope font-bold text-xl text-white/95">{project.name}</h4>
                        <div className="flex items-center justify-end gap-3">
                          <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_13866_9712)">
                              <path d="M14.1033 2.56698C14.4701 1.82374 15.5299 1.82374 15.8967 2.56699L19.1757 9.21093C19.3214 9.50607 19.6029 9.71064 19.9287 9.75797L27.2607 10.8234C28.0809 10.9426 28.4084 11.9505 27.8149 12.5291L22.5094 17.7007C22.2737 17.9304 22.1662 18.2614 22.2218 18.5858L23.4743 25.8882C23.6144 26.7051 22.7569 27.3281 22.0233 26.9424L15.4653 23.4946C15.174 23.3415 14.826 23.3415 14.5347 23.4946L7.9767 26.9424C7.24307 27.3281 6.38563 26.7051 6.52574 25.8882L7.7782 18.5858C7.83384 18.2614 7.72629 17.9304 7.49061 17.7007L2.1851 12.5291C1.59159 11.9505 1.91909 10.9426 2.73931 10.8234L10.0713 9.75797C10.3971 9.71064 10.6786 9.50607 10.8243 9.21093L14.1033 2.56698Z" fill="#F3F4F6"></path>
                              <g clipPath="url(#clip1_13866_9712)">
                                <path d="M14.1033 2.56698C14.4701 1.82374 15.5299 1.82374 15.8967 2.56699L19.1757 9.21093C19.3214 9.50607 19.6029 9.71064 19.9287 9.75797L27.2607 10.8234C28.0809 10.9426 28.4084 11.9505 27.8149 12.5291L22.5094 17.7007C22.2737 17.9304 22.1662 18.2614 22.2218 18.5858L23.4743 25.8882C23.6144 26.7051 22.7569 27.3281 22.0233 26.9424L15.4653 23.4946C15.174 23.3415 14.826 23.3415 14.5347 23.4946L7.9767 26.9424C7.24307 27.3281 6.38563 26.7051 6.52574 25.8882L7.7782 18.5858C7.83384 18.2614 7.72629 17.9304 7.49061 17.7007L2.1851 12.5291C1.59159 11.9505 1.91909 10.9426 2.73931 10.8234L10.0713 9.75797C10.3971 9.71064 10.6786 9.50607 10.8243 9.21093L14.1033 2.56698Z" fill="#FBBF24"></path>
                              </g>
                            </g>
                            <defs>
                              <clipPath id="clip0_13866_9712">
                                <rect width="30" height="30" fill="white"></rect>
                              </clipPath>
                              <clipPath id="clip1_13866_9712">
                                <rect width="30" height="30" fill="white"></rect>
                              </clipPath>
                            </defs>
                          </svg>
                          <span className="text-sm font-medium text-white/90">{project.stargazers_count > 0 ? (project.stargazers_count / 10).toFixed(1) : '5.0'}</span>
                        </div>
                      </div>
                      
                      <p className="text-base font-medium text-white/85 mb-4 text-left w-full">
                        {project.summary?.description || project.description || 'A modern web application showcasing innovative development practices and cutting-edge technologies for enhanced user experience.'}
                      </p>
                      

                      
                      <div className="flex items-center justify-start w-full gap-4 mb-4">
                        <a 
                          href={`/projects/${project.name}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/projects/${project.name}`, project.name);
                          }}
                          className="w-10 aspect-square rounded-full bg-gray-50 border-gray-600 border flex items-center justify-center transition-all duration-500 hover:bg-gray-100 hover:border-gray-900"
                        >
                          <svg className="stroke-gray-700 hover:stroke-gray-900" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M13 14.9082L7 14.9082M1 8.91454V14.9082C1 16.8371 1 17.8015 1.58579 18.4008C2.17157 19 3.11438 19 5 19H15C16.8856 19 17.8284 19 18.4142 18.4008C19 17.8015 19 16.8371 19 14.9082V11.1044C19 8.96044 19 7.88847 18.5267 6.98381C18.0534 6.07914 17.1815 5.48452 15.4376 4.29527L12.2188 2.10017C11.1433 1.36672 10.6056 1 10 1C9.39445 1 8.8567 1.36673 7.7812 2.10017L2.7812 5.50998C1.90927 6.10461 1.4733 6.40192 1.23665 6.85425C1 7.30658 1 7.84257 1 8.91454Z" stroke="" strokeWidth="1.6" strokeLinecap="round"></path>
                          </svg>
                        </a>
                        
                        <a 
                          href={project.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 aspect-square rounded-full bg-gray-50 border-gray-600 border flex items-center justify-center transition-all duration-500 hover:bg-gray-100 hover:border-gray-900"
                        >
                          <svg className="stroke-gray-700 hover:stroke-gray-900" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </a>
                        
                        {hasDeployment && (
                          <a 
                            href={primaryLiveLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!primaryLiveLink) {
                                e.preventDefault();
                              }
                            }}
                            className="w-10 aspect-square rounded-full bg-gray-50 border-gray-600 border flex items-center justify-center transition-all duration-500 hover:bg-gray-100 hover:border-gray-900"
                          >
                            <ExternalLink className="w-4 h-4 stroke-gray-700 hover:stroke-gray-900" />
                          </a>
                        )}
                      </div>
                      
                      {/* Multiple Links Indicator */}
                      {hasDeployment && project.summary!.live_links!.length > 1 && (
                        <div className="text-xs text-white/60">
                          +{project.summary!.live_links!.length - 1} more deployment{project.summary!.live_links!.length > 2 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TransparentGlassCard>
                );
              })}
            </div>
          </div>
        </Parallax>
      </div>
    </section>
  );
}