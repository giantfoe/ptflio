import { NextRequest, NextResponse } from 'next/server';
import { createYouTubeService } from '@/utils/youtube-service';
import { cacheManager } from '@/utils/cache-manager';
import { createApiLogger } from '@/utils/logger';

// Cache configuration
const CACHE_TTL = parseInt(process.env.YOUTUBE_CACHE_TTL || '3600'); // 1 hour
const CACHE_KEY_PREFIX = 'youtube:videos';

// API configuration
const MAX_RESULTS = parseInt(process.env.YOUTUBE_MAX_RESULTS || '10');
const ENABLE_CACHING = process.env.YOUTUBE_ENABLE_CACHING !== 'false';

export async function GET(request: NextRequest) {
  const apiLogger = createApiLogger('/api/youtube', request);
  const startTime = Date.now();
  
  try {
    apiLogger.info('Enhanced YouTube API request started', {
      enableCaching: ENABLE_CACHING,
      maxResults: MAX_RESULTS,
      cacheTtl: CACHE_TTL
    });
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || MAX_RESULTS.toString());
    const pageToken = searchParams.get('pageToken') || undefined;
    const publishedAfter = searchParams.get('publishedAfter') || undefined;
    const publishedBefore = searchParams.get('publishedBefore') || undefined;
    
    // Generate cache key based on parameters
    const cacheKey = `${CACHE_KEY_PREFIX}:${maxResults}:${pageToken || 'none'}:${publishedAfter || 'none'}:${publishedBefore || 'none'}`;
    
    // Try to get from cache first
    let cacheResult = null;
    if (ENABLE_CACHING) {
      cacheResult = await cacheManager.get(cacheKey);
      
      if (cacheResult.success && cacheResult.fromCache) {
        const requestDuration = Date.now() - startTime;
        
        apiLogger.info('YouTube API cache hit', {
          cacheKey,
          source: cacheResult.source,
          requestDuration,
          itemCount: Array.isArray((cacheResult.data as { data?: unknown[] })?.data) ? (cacheResult.data as { data: unknown[] }).data.length : 0
        });
        
        return NextResponse.json({
          ...(typeof cacheResult.data === 'object' && cacheResult.data !== null ? cacheResult.data : {}),
          _metadata: {
            cached: true,
            source: cacheResult.source,
            requestDuration
          }
        });
      }
    }
    
    // Create YouTube service instance
    const youtubeService = createYouTubeService();
    
    // Validate service configuration
    const configValidation = youtubeService.validateConfiguration();
    if (!configValidation.isValid) {
      apiLogger.warn('YouTube service configuration invalid', {
        error: configValidation.error,
        suggestion: configValidation.suggestion
      });
      
      return NextResponse.json(
        {
          error: 'Configuration Error',
          message: 'YouTube API is not properly configured',
          details: {
            service: 'YouTube',
            configurationError: configValidation.error,
            suggestion: configValidation.suggestion
          },
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }
    
    // Fetch videos from YouTube service
    apiLogger.debug('Fetching videos from YouTube service', {
      maxResults,
      pageToken,
      publishedAfter,
      publishedBefore
    });
    
    const serviceResult = await youtubeService.getChannelVideos({
      maxResults,
      pageToken,
      publishedAfter,
      publishedBefore
    });
    
    if (!serviceResult.success) {
      const requestDuration = Date.now() - startTime;
      
      apiLogger.error('YouTube service request failed', {
        errorType: serviceResult.error?.type,
        errorMessage: serviceResult.error?.message,
        requestDuration
      });
      
      // Map service error types to HTTP status codes
      let statusCode = 500;
      switch (serviceResult.error?.type) {
        case 'CONFIGURATION':
          statusCode = 503;
          break;
        case 'API':
          statusCode = 403;
          break;
        case 'VALIDATION':
          statusCode = 400;
          break;
        case 'RATE_LIMIT':
          statusCode = 429;
          break;
        case 'NETWORK':
          statusCode = 502;
          break;
        default:
          statusCode = 500;
      }
      
      return NextResponse.json(
        {
          error: serviceResult.error?.type || 'Unknown Error',
          message: serviceResult.error?.message || 'An unknown error occurred',
          details: {
            service: 'YouTube',
            errorType: serviceResult.error?.type,
            requestDuration,
            ...(typeof serviceResult.error?.details === 'object' && serviceResult.error?.details !== null ? serviceResult.error.details : {})
          },
          timestamp: new Date().toISOString()
        },
        { status: statusCode }
      );
    }
    
    const requestDuration = Date.now() - startTime;
    
    // Prepare response data
    const responseData = {
      data: serviceResult.data,
      metadata: {
        ...serviceResult.metadata,
        cached: false,
        requestDuration
      }
    };
    
    // Cache the successful result
    if (ENABLE_CACHING && serviceResult.data) {
      const cacheSetResult = await cacheManager.set(cacheKey, responseData, CACHE_TTL);
      
      apiLogger.debug('Cache set operation', {
        cacheKey,
        success: cacheSetResult.success,
        source: cacheSetResult.source,
        error: cacheSetResult.error
      });
    }
    
    apiLogger.info('YouTube API request completed successfully', {
      itemCount: serviceResult.data?.length || 0,
      totalResults: serviceResult.metadata?.totalResults || 0,
      requestDuration,
      cached: false
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    const requestDuration = Date.now() - startTime;
    
    apiLogger.error('YouTube API request failed with unexpected exception', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestDuration
    });
    
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing the request',
        details: {
          service: 'YouTube',
          requestDuration,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}