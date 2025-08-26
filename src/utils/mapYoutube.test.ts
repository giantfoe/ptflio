import { describe, it, expect } from 'vitest';
import { mapYoutubeResponse } from './mapYoutube';

describe('mapYoutubeResponse', () => {
  it('should map YouTube API response correctly', () => {
    const mockData = {
      items: [
        {
          id: { videoId: '123' },
          snippet: {
            title: 'Test Video',
            publishedAt: '2023-01-01T00:00:00Z',
            thumbnails: { high: { url: 'https://example.com/thumb.jpg' } },
          },
        },
      ],
    };

    const result = mapYoutubeResponse(mockData);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '123',
      source: 'youtube',
      title: 'Test Video',
      url: 'https://www.youtube.com/watch?v=123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      timestamp: '2023-01-01T00:00:00Z',
      metadata: { channelId: '' },
    });
  });

  it('should handle empty items', () => {
    const result = mapYoutubeResponse({ items: [] });
    expect(result).toEqual([]);
  });
});