import { ApiResponse } from '../components/sections/Streams';

interface YouTubeThumbnail {
  url: string;
}

interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

interface YouTubeSnippet {
  title?: string;
  publishedAt?: string;
  thumbnails?: YouTubeThumbnails;
}

interface YouTubeItem {
  id?: {
    videoId?: string;
  } | string;
  snippet?: YouTubeSnippet;
}

export interface YouTubeResponse {
  items: YouTubeItem[];
  pageInfo?: {
    totalResults?: number;
    resultsPerPage?: number;
  };
  nextPageToken?: string;
  prevPageToken?: string;
}

export function mapYoutubeResponse(data: YouTubeResponse): ApiResponse['data'] {
  return (data.items || []).map((item: YouTubeItem) => {
    const id = typeof item.id === 'object' ? item.id?.videoId : item.id;
    const snippet = item.snippet || {};
    const title = snippet.title || '';
    const publishedAt = snippet.publishedAt || new Date().toISOString();
    const thumbnail =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      undefined;

    return {
      id: String(id),
      source: 'youtube',
      title,
      text: title, // Use title as text for YouTube videos
      url: id ? `https://www.youtube.com/watch?v=${id}` : '',
      thumbnailUrl: thumbnail,
      timestamp: publishedAt,
      metadata: {
        channelId: process.env.YOUTUBE_CHANNEL_ID || '',
      },
    };
  });
}