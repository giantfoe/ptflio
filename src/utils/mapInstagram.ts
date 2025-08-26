import { ApiResponse } from '../components/sections/Streams';

interface InstagramMedia {
  id: string | number;
  media_type: string;
  caption?: string;
  permalink: string;
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
}

export interface InstagramResponse {
  data: InstagramMedia[];
}

export function mapInstagramResponse(data: InstagramResponse): ApiResponse['data'] {
  return (data.data || []).map((m: InstagramMedia) => {
    const isVideo = m.media_type === 'VIDEO';
    return {
      id: String(m.id),
      source: 'instagram',
      title: m.caption?.slice(0, 120) || 'Instagram Post',
      text: m.caption || 'Instagram Post',
      url: m.permalink,
      imageUrl: !isVideo ? m.media_url : undefined,
      thumbnailUrl: isVideo ? m.thumbnail_url ?? m.media_url : undefined,
      videoUrl: isVideo ? m.media_url : undefined,
      timestamp: m.timestamp,
    };
  });
}