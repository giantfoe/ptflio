import { ApiResponse } from '../components/sections/Streams';

interface GitHubEvent {
  id: string | number;
  type: string;
  created_at: string;
  repo?: {
    name: string;
  };
  payload?: {
    commits?: Array<{
      message?: string;
    }>;
  };
}

export function mapGithubResponse(data: GitHubEvent[]): ApiResponse['data'] {
  return (data || []).map((e: GitHubEvent) => {
    const repoName = e.repo?.name;
    const webUrl = repoName ? `https://github.com/${repoName}` : undefined;
    const evtType: string = e.type;
    let title = `${evtType.replace(/Event$/, '')} @ ${repoName || 'repo'}`;

    if (evtType === 'PushEvent' && e.payload?.commits?.length) {
      const c = e.payload.commits[0];
      title = `push: ${c.message?.slice(0, 80) || 'commit'} (${repoName})`;
    }

    return {
      id: String(e.id),
      source: 'github',
      title,
      text: title, // Use title as text for GitHub events
      url: webUrl || '',
      timestamp: e.created_at,
      metadata: {
        eventType: evtType,
        repo: repoName,
      },
    };
  });
}