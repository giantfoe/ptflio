import { describe, it, expect } from 'vitest';
import { mapGithubResponse } from './mapGithub';

describe('mapGithubResponse', () => {
  it('should map GitHub API response correctly for PushEvent', () => {
    const mockData = [
      {
        id: '123',
        type: 'PushEvent',
        repo: { name: 'user/repo' },
        created_at: '2023-01-01T00:00:00Z',
        payload: {
          commits: [{ message: 'Test commit' }],
        },
      },
    ];

    const result = mapGithubResponse(mockData);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '123',
      source: 'github',
      title: 'push: Test commit (user/repo)',
      url: 'https://github.com/user/repo',
      timestamp: '2023-01-01T00:00:00Z',
      metadata: {
        eventType: 'PushEvent',
        repo: 'user/repo',
      },
    });
  });

  it('should map other event types', () => {
    const mockData = [
      {
        id: '456',
        type: 'WatchEvent',
        repo: { name: 'user/repo2' },
        created_at: '2023-01-02T00:00:00Z',
      },
    ];

    const result = mapGithubResponse(mockData);

    expect(result[0].title).toBe('Watch @ user/repo2');
  });

  it('should handle empty array', () => {
    const result = mapGithubResponse([]);
    expect(result).toEqual([]);
  });
});