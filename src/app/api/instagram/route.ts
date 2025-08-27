import { NextResponse } from 'next/server'
import { logger } from '../../../utils/logger'
import { manualInstagramService } from '../../../utils/manual-instagram-service'

const REVALIDATE_SECONDS = 900 // 15 minutes
const TAG = 'instagram'
const JUICER_FEED_NAME = 'ayorinde_john'

// Interface for Juicer feed items
interface JuicerFeedItem {
  id: string;
  message?: string;
  full?: string;
  image?: string;
  external?: string;
  source?: {
    source: string;
    term: string;
  };
  date?: string;
  edit?: string;
}

interface JuicerResponse {
  posts?: JuicerFeedItem[];
  items?: JuicerFeedItem[];
}

// Function to fetch from Juicer feed
async function fetchJuicerFeed(): Promise<JuicerFeedItem[]> {
  const juicerEndpoints = [
    `https://www.juicer.io/api/feeds/${JUICER_FEED_NAME}`
  ];

  for (const endpoint of juicerEndpoints) {
    try {
      logger.info(`Attempting to fetch from Juicer endpoint: ${endpoint}`, {});
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-App/1.0'
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Failed to fetch from ${endpoint}:`, {
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseBody: errorText.substring(0, 200),
          endpoint
        });
        continue;
      }
      
      const data = await response.json();
      logger.info(`Juicer API response structure:`, {
        hasData: !!data,
        hasPosts: !!data.posts,
        hasPostsData: !!data.posts?.data,
        hasItems: !!data.items,
        dataKeys: Object.keys(data || {}),
        postsKeys: data.posts ? Object.keys(data.posts) : [],
        endpoint
      });
      
      // Handle different response structures
        let posts: any[] = [];
        if (data.posts?.items) {
          posts = data.posts.items;
        } else if (data.posts?.data) {
          posts = data.posts.data;
        } else if (Array.isArray(data.posts)) {
          posts = data.posts;
        } else if (data.items) {
          posts = data.items;
        } else if (data.data) {
          posts = data.data;
        } else if (Array.isArray(data)) {
          posts = data;
        }
      
      logger.info(`Extracted posts:`, {
        postsCount: posts.length,
        firstPostKeys: posts[0] ? Object.keys(posts[0]) : [],
        endpoint
      });
      
      if (posts && posts.length > 0) {
        return posts;
      }
      
    } catch (error) {
      logger.warn(`Failed to fetch from ${endpoint}:`, {
        error: error instanceof Error ? error.message : 'fetch failed',
        stack: error instanceof Error ? error.stack : undefined,
        endpoint
      });
      continue;
    }
  }

  // If all endpoints fail, return empty array
  logger.warn('All Juicer endpoints failed, returning empty array');
  return [];
}

// Function to transform Juicer items to expected format
function transformJuicerItems(juicerItems: any[]) {
  return juicerItems
    .filter(item => item.source?.source === 'Instagram' || !item.source) // Filter for Instagram posts or unknown source
    .slice(0, 10) // Limit to 10 posts
    .map(item => {
      // Handle media array or single image
      let mediaUrl = '';
      let mediaType = 'IMAGE';
      
      if (item.media && Array.isArray(item.media) && item.media.length > 0) {
        mediaUrl = item.media[0].url || item.media[0].image || '';
        mediaType = item.media.length > 1 ? 'CAROUSEL_ALBUM' : 'IMAGE';
      } else if (item.image) {
        mediaUrl = item.image;
      }
      
      return {
        id: item.id || `juicer_${Date.now()}_${Math.random()}`,
        caption: item.unformatted_message || item.message || item.full || '',
        media_type: mediaType,
        media_url: mediaUrl,
        permalink: item.external || item.edit || `https://www.juicer.io/hub/${JUICER_FEED_NAME}`,
        timestamp: item.external_created_at || item.date || new Date().toISOString(),
        thumbnailUrl: mediaUrl, // Add thumbnail for compatibility
        imageUrl: mediaUrl, // Add image URL for compatibility
        url: item.external || item.edit || `https://www.juicer.io/hub/${JUICER_FEED_NAME}`,
        title: item.unformatted_message || item.message || 'Instagram Post'
      };
    });
}

export async function GET() {
  try {
    logger.info('Fetching Instagram content via Juicer integration', {
      service: 'instagram',
      source: 'juicer',
      feedName: JUICER_FEED_NAME
    })

    // Try to fetch from Juicer feed API
    const juicerItems = await fetchJuicerFeed();
    let items = [];

    if (juicerItems.length > 0) {
      // Transform Juicer items to expected format
      items = transformJuicerItems(juicerItems);
      logger.info(`Transformed ${items.length} Juicer items to Instagram format`);
    } else {
      // Fallback to manual posts if Juicer fetch fails
      logger.info('Falling back to manual posts as Juicer fetch returned no items');
      const manualPosts = manualInstagramService.getActivePosts();
      items = manualPosts.map(post => ({
        id: post.id,
        caption: post.description || post.title || '',
        media_type: 'IMAGE',
        media_url: post.url,
        permalink: post.url,
        timestamp: post.addedAt
      }));
    }
    
    // Get widget configuration
    const widgetConfig = manualInstagramService.getWidgetConfig()

    logger.info('Instagram content fetched successfully', {
      service: 'instagram',
      source: 'juicer',
      itemsCount: items.length,
      widgetEnabled: widgetConfig?.isEnabled || false,
      cacheTag: TAG,
      feedName: JUICER_FEED_NAME
    })

    return NextResponse.json(
      {
        source: 'instagram',
        integration: 'juicer',
        count: items.length,
        items,
        widget: {
          enabled: widgetConfig?.isEnabled || false,
          provider: widgetConfig?.provider || 'juicer',
          feedUrl: `https://www.juicer.io/hub/${JUICER_FEED_NAME}`
        }
      },
      { 
        headers: { 'Cache-Tag': TAG }
      }
    )
  } catch (err: unknown) {
    const error = err as Error;
    
    logger.error('Instagram Juicer integration error', {
      service: 'instagram',
      source: 'juicer',
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Instagram Integration Error',
        message: error?.message || 'Unexpected error occurred while fetching Instagram data',
        service: 'instagram',
        source: 'juicer',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}