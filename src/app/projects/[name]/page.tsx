'use client';

import { use } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';

interface RepoDetails {
  description: string;
  homepage: string | null;
  commits: Array<{ sha: string; message: string; date: string }>;
}

export default function ProjectDetail({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const { data, error } = useSWR<RepoDetails>(`/api/github/${name}`, fetcher);

  if (error) return <div>Error loading project details</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{name}</h1>
      <p className="mb-4">{data.description}</p>
      {data.homepage && (
        <a href={data.homepage} className="text-blue-500 mb-4 block">Visit Website</a>
      )}
      <h2 className="text-2xl font-semibold mb-2">Recent Commits</h2>
      <ul>
        {data.commits.map((commit) => (
          <li key={commit.sha} className="mb-2">
            <p>{commit.message}</p>
            <p className="text-sm text-gray-500">{commit.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}