'use client';

import useSWR from 'swr';
import Link from 'next/link';

interface Project {
  name: string;
  description: string;
  html_url: string;
  summary?: {
    description: string;
    functionality: string;
    liveLink?: string;
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

  if (isLoading) return <p>Loading projects...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.items?.length) return <p>No projects available</p>;

  return (
    <section id="projects" className="min-h-[100svh] py-24 bg-[color-mix(in_oklab,black,white_5%)]">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-8 text-white">Projects</h2>
        <p className="text-neutral-300 mb-6">Explore my GitHub repositories showcasing various projects and contributions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((project) => (
            <Link key={project.name} href={`/projects/${project.name}`} className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:border-white/30 transition block">
              <article>
                <div className="h-40 rounded-md bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-pink-500/30 mb-4" />
                <h3 className="text-lg font-medium text-white">{project.name}</h3>
                <p className="text-sm text-neutral-300 mt-1">{project.summary?.description || project.description}</p>
                {project.summary?.liveLink && (
                  <span className="text-blue-400 text-sm mt-2 block">Live Demo Available</span>
                )}
                <span className="text-blue-400 text-sm mt-2 block">View Details →</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}