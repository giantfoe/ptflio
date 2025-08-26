import { describe, it, expect } from 'vitest';
import { mapInstagramResponse } from './mapInstagram';

describe('mapInstagramResponse', () => {
  it('should map Instagram API response correctly for image', () => {
    const mockData = {
      data: [
        {
          id: '456',
          caption: 'Test Caption',
          media_type: 'IMAGE',
          media_url: 'https://example.com/image.jpg',
          permalink: 'https://instagram.com/p/123/',
          timestamp: '2023-01-01T00:00:00Z',
        },
      ],
    };

    const result = mapInstagramResponse(mockData);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '456',
      source: 'instagram',
      title: 'Test Caption',
      text: 'Test Caption',
      url: 'https://instagram.com/p/123/',
      imageUrl: 'https://example.com/image.jpg',
      thumbnailUrl: undefined,
      videoUrl: undefined,
      timestamp: '2023-01-01T00:00:00Z',
    });
  });

  it('should handle video media', () => {
    const mockData = {
      data: [
        {
          id: '789',
          caption: 'Video Caption',
          media_type: 'VIDEO',
          media_url: 'https://example.com/video.mp4',
          thumbnail_url: 'https://example.com/thumb.jpg',
          permalink: 'https://instagram.com/p/456/',
          timestamp: '2023-01-02T00:00:00Z',
        },
      ],
    };

    const result = mapInstagramResponse(mockData);

    expect(result[0]).toEqual(expect.objectContaining({
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      imageUrl: undefined,
    }));
  });

  it('should handle empty data', () => {
    const result = mapInstagramResponse({ data: [] });
    expect(result).toEqual([]);
  });
});