'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ProjectHeader } from '@/components/ui/ProjectHeader';
import { AIDescriptionGenerator } from '@/utils/aiDescriptionGenerator';

interface GitHubApiResponse {
  repository: {
    name: string;
    description: string | null;
    homepage: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    updated_at: string;
    created_at: string;
    topics: string[];
    license: {
      name: string;
      spdx_id: string;
    } | null;
    open_issues_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    owner: {
      login: string;
    };
  };
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  }>;
  languages: Array<{
    name: string;
    percentage: number;
    bytes: number;
  }>;
  releases: Array<{
    tag_name: string;
    name: string;
    published_at: string;
    url: string;
    body: string;
  }>;
  readme: string;
  stats: {
    totalLanguages: number;
    totalReleases: number;
    totalCommits: number;
    repositorySize: number;
  };
}

import { useParams } from 'next/navigation';
import { LivePreview } from '@/components/ui/LivePreview';
import { StatCard } from '@/components/ui/StatCard';
import { TechnologyBadge } from '@/components/ui/TechnologyBadge';
import { AIGeneratedDescription } from '@/utils/aiDescriptionGenerator';
import { GitCommit, Calendar, Package } from 'lucide-react';
import { useRSCNavigation, isRSCError, parseRSCError } from '@/hooks/useRSCNavigation';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { fetcher } from '@/utils/fetcher';

export default function ProjectPage() {
  const params = useParams();
  const projectName = params.name as string;
  const [aiDescription, setAiDescription] = useState<AIGeneratedDescription | null>(null);
  const { navigate, refresh, state: navState, clearError } = useRSCNavigation();

  const { data, error, isLoading, mutate } = useSWR<GitHubApiResponse>(
    `/api/github/${projectName}`,
    fetcher,
    {
      onError: (error) => {
        console.error('SWR Error:', error);
        // Check if it's an RSC-related error
        if (isRSCError(error)) {
          const rscDetails = parseRSCError(error);
          console.log('RSC Error Details:', rscDetails);
        }
      },
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      shouldRetryOnError: (error) => {
        // Don't retry on RSC errors, let our navigation handler deal with them
        return !isRSCError(error);
      }
    }
  );

  // Generate AI description when data is loaded
  useEffect(() => {
    if (data && data.readme) {
      const description = AIDescriptionGenerator.generateDescription({
        repository: data.repository,
        readme: data.readme || '',
        languages: data.languages || [],
        releases: data.releases || []
      });
      setAiDescription(description);
    }
  }, [data]);

  if (isLoading || navState.isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || navState.error) {
    const currentError = navState.error || error;
    const isRSCErr = isRSCError(currentError);
    
    return (
      <ErrorDisplay
        error={currentError}
        onRetry={() => {
          clearError();
          if (isRSCErr) {
            refresh();
          } else {
            mutate();
          }
        }}
        onGoHome={() => navigate('/')}
        showDetails={true}
      />
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Project Header */}
      <ProjectHeader
        name={projectName}
        description={data.repository?.description || 'No description available'}
        aiDescription={aiDescription}
        homepage={data.repository?.homepage || undefined}
        githubUrl={data.repository?.html_url}
        stats={{
          stars: data.repository?.stargazers_count || 0,
          forks: data.repository?.forks_count || 0,
          watchers: data.repository?.watchers_count || 0,
          issues: data.repository?.open_issues_count || 0,
          size: data.repository?.size || 0
        }}
        languages={data.languages && data.languages.length > 0 ? data.languages.reduce((acc, lang) => ({ ...acc, [lang.name]: lang.bytes || 0 }), {}) : {}}
        topics={data.repository?.topics || []}
        license={data.repository?.license?.name}
        createdAt={data.repository?.created_at}
        updatedAt={data.repository?.updated_at}
        owner={data.repository?.owner?.login || 'Unknown'}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Live Preview Section */}
        {data.repository?.homepage && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Live Preview
            </h2>
            <LivePreview
              url={data.repository.homepage}
              title={`${projectName} - Live Demo`}
              height={600}
              showControls={true}
              allowFullscreen={true}
            />
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <GitCommit className="w-6 h-6" />
                Recent Activity
              </h2>
              
              {data.commits && data.commits.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {data.commits.map((commit: { sha: string; message: string; author: string; date: string }, index: number) => (
                    <div 
                      key={commit.sha} 
                      className={`p-4 ${index !== data.commits.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white mb-1">
                            {commit.message.split('\n')[0]}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>by {commit.author}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(commit.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <GitCommit className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No recent commits available</p>
                </div>
              )}
            </section>

            {/* Releases */}
            {data.releases && data.releases.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Latest Releases
                </h2>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {data.releases.slice(0, 5).map((release: { tag_name: string; name: string; published_at: string; url: string; body: string }, index: number) => (
                    <div 
                      key={release.tag_name} 
                      className={`p-4 ${index !== Math.min(4, data.releases.length - 1) ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {release.name || release.tag_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {release.body ? release.body.substring(0, 150) + (release.body.length > 150 ? '...' : '') : 'No description available'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>v{release.tag_name}</span>
                            <span>{formatDate(release.published_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Repository Statistics */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Repository Statistics
              </h3>
              <div className="space-y-3">
                <StatCard
                  label="Total Stars"
                  value={data.repository?.stargazers_count || 0}
                  icon="star"
                  size="sm"
                />
                <StatCard
                  label="Forks"
                  value={data.repository?.forks_count || 0}
                  icon="fork"
                  size="sm"
                />
                <StatCard
                  label="Open Issues"
                  value={data.repository?.open_issues_count || 0}
                  icon="issue"
                  size="sm"
                />
                <StatCard
                  label="Watchers"
                  value={data.repository?.watchers_count || 0}
                  icon="eye"
                  size="sm"
                />
              </div>
            </section>

            {/* Language Breakdown */}
            {data.languages && data.languages.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Language Breakdown
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="space-y-3">
                    {data.languages
                      .sort((a, b) => b.bytes - a.bytes)
                      .map((language) => {
                        return (
                          <div key={language.name} className="flex items-center justify-between">
                            <TechnologyBadge name={language.name} size="sm" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {language.percentage}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}