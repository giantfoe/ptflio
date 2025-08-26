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
    `https://www.juicer.io/api/feeds/${JUICER_FEED_NAME}`,
    `https://www.juicer.io/api/feeds/${JUICER_FEED_NAME}.json`,
    `https://api.juicer.io/feeds/${JUICER_FEED_NAME}`,
    `https://api.juicer.io/feeds/${JUICER_FEED_NAME}.json`
  ];

  for (const endpoint of juicerEndpoints) {
    try {
      logger.info(`Attempting to fetch from Juicer endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-App/1.0'
        },
        next: { revalidate: REVALIDATE_SECONDS }
      });

      if (response.ok) {
        const data: JuicerResponse = await response.json();
        const posts = data.posts || data.items || [];
        
        if (posts.length > 0) {
          logger.info(`Successfully fetched ${posts.length} posts from ${endpoint}`);
          return posts;
        }
      }
    } catch (error) {
      logger.warn(`Failed to fetch from ${endpoint}:`, {
        error: error instanceof Error ? error.message : String(error),
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
function transformJuicerItems(juicerItems: JuicerFeedItem[]) {
  return juicerItems
    .filter(item => item.source?.source === 'Instagram' || !item.source) // Filter for Instagram posts or unknown source
    .slice(0, 10) // Limit to 10 posts
    .map(item => ({
      id: item.id || `juicer_${Date.now()}_${Math.random()}`,
      caption: item.message || item.full || '',
      media_type: item.image ? 'IMAGE' : 'CAROUSEL_ALBUM',
      media_url: item.image || '',
      permalink: item.external || item.edit || `https://www.juicer.io/hub/${JUICER_FEED_NAME}`,
      timestamp: item.date || new Date().toISOString()
    }));
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