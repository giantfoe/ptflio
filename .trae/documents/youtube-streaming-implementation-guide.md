# YouTube Content Streaming System - Implementation Guide

## 1. Implementation Overview

This guide provides step-by-step instructions for implementing the complete YouTube streaming system redesign. The implementation follows a modular approach with clear separation of concerns, comprehensive error handling, and modern caching strategies.

## 2. Prerequisites

### 2.1 Required Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "swr": "^2.2.0",
    "redis": "^4.6.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0"
  }
}
```

### 2.2 Environment Setup
```bash
# Required YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here

# Optional Redis Configuration
REDIS_URL=redis://localhost:6379

# Optional Performance Settings
YOUTUBE_CACHE_TTL=600
YOUTUBE_MAX_RESULTS=50
YOUTUBE_REQUEST_TIMEOUT=10000
```

## 3. Core Service Implementation

### 3.1 YouTube Service Client

**File: `src/services/youtube/client.ts`**
```typescript
import { z } from 'zod';
import { logger } from '@/utils/logger';

const YouTubeVideoSchema = z.object({
  id: z.object({ videoId: z.string() }).or(z.string()),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    thumbnails: z.object({
      maxres: z.object({ url: z.string() }).optional(),
      high: z.object({ url: z.string() }).optional(),
      medium: z.object({ url: z.string() }).optional(),
      default: z.object({ url: z.string() }).optional(),
    }),
    channelTitle: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

const YouTubeResponseSchema = z.object({
  items: z.array(YouTubeVideoSchema),
  nextPageToken: z.string().optional(),
  pageInfo: z.object({
    totalResults: z.number(),
    resultsPerPage: z.number(),
  }),
});

export interface YouTubeClientConfig {
  apiKey: string;
  channelId: string;
  maxResults?: number;
  timeout?: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
  tags: string[];
  url: string;
}

export class YouTubeClient {
  private config: YouTubeClientConfig;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(config: YouTubeClientConfig) {
    this.config = {
      maxResults: 10,
      timeout: 10000,
      ...config,
    };
  }

  async fetchVideos(options: {
    maxResults?: number;
    order?: 'date' | 'relevance' | 'viewCount';
    publishedAfter?: string;
    pageToken?: string;
  } = {}): Promise<{
    items: VideoItem[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    const params = new URLSearchParams({
      key: this.config.apiKey,
      channelId: this.config.channelId,
      part: 'snippet',
      type: 'video',
      order: options.order || 'date',
      maxResults: String(options.maxResults || this.config.maxResults),
      ...(options.publishedAfter && { publishedAfter: options.publishedAfter }),
      ...(options.pageToken && { pageToken: options.pageToken }),
    });

    const url = `${this.baseUrl}/search?${params.toString()}`;
    
    logger.info('Fetching YouTube videos', {
      channelId: this.config.channelId.substring(0, 8) + '...',
      maxResults: options.maxResults || this.config.maxResults,
      order: options.order || 'date',
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const validatedData = YouTubeResponseSchema.parse(data);

      const items = validatedData.items.map(this.transformVideoItem);

      logger.info('Successfully fetched YouTube videos', {
        count: items.length,
        totalResults: validatedData.pageInfo.totalResults,
      });

      return {
        items,
        nextPageToken: validatedData.nextPageToken,
        totalResults: validatedData.pageInfo.totalResults,
      };
    } catch (error) {
      logger.error('Failed to fetch YouTube videos', { error });
      throw error;
    }
  }

  private transformVideoItem(item: z.infer<typeof YouTubeVideoSchema>): VideoItem {
    const videoId = typeof item.id === 'object' ? item.id.videoId : item.id;
    const thumbnails = item.snippet.thumbnails;
    const thumbnailUrl = 
      thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url ||
      '';

    return {
      id: videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      tags: item.snippet.tags || [],
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await this.fetchVideos({ maxResults: 1 });
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 2000 ? 'healthy' : 'degraded',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

### 3.2 Cache Manager

**File: `src/services/cache/manager.ts`**
```typescript
import Redis from 'redis';
import { logger } from '@/utils/logger';

export interface CacheConfig {
  redisUrl?: string;
  defaultTTL?: number;
  keyPrefix?: string;
}

export interface CacheInfo {
  cached: boolean;
  ttl: number;
  lastUpdated: string;
  hitCount?: number;
}

export class CacheManager {
  private redis: Redis.RedisClientType | null = null;
  private config: Required<CacheConfig>;
  private memoryCache = new Map<string, { data: any; expiresAt: number; hitCount: number }>();

  constructor(config: CacheConfig = {}) {
    this.config = {
      redisUrl: config.redisUrl || process.env.REDIS_URL || '',
      defaultTTL: config.defaultTTL || 600,
      keyPrefix: config.keyPrefix || 'youtube:',
    };

    this.initializeRedis();
  }

  private async initializeRedis() {
    if (!this.config.redisUrl) {
      logger.warn('Redis URL not configured, using memory cache only');
      return;
    }

    try {
      this.redis = Redis.createClient({ url: this.config.redisUrl });
      await this.redis.connect();
      logger.info('Redis cache connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis, falling back to memory cache', { error });
      this.redis = null;
    }
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<{ data: T; cacheInfo: CacheInfo } | null> {
    const fullKey = this.getKey(key);

    try {
      if (this.redis) {
        const data = await this.redis.get(fullKey);
        if (data) {
          const ttl = await this.redis.ttl(fullKey);
          await this.redis.incr(`${fullKey}:hits`);
          const hitCount = await this.redis.get(`${fullKey}:hits`);
          
          return {
            data: JSON.parse(data),
            cacheInfo: {
              cached: true,
              ttl,
              lastUpdated: new Date().toISOString(),
              hitCount: parseInt(hitCount || '0'),
            },
          };
        }
      } else {
        const cached = this.memoryCache.get(fullKey);
        if (cached && cached.expiresAt > Date.now()) {
          cached.hitCount++;
          return {
            data: cached.data,
            cacheInfo: {
              cached: true,
              ttl: Math.floor((cached.expiresAt - Date.now()) / 1000),
              lastUpdated: new Date().toISOString(),
              hitCount: cached.hitCount,
            },
          };
        }
      }
    } catch (error) {
      logger.error('Cache get error', { key: fullKey, error });
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const cacheTTL = ttl || this.config.defaultTTL;

    try {
      if (this.redis) {
        await this.redis.setEx(fullKey, cacheTTL, JSON.stringify(data));
        await this.redis.set(`${fullKey}:hits`, '0');
      } else {
        this.memoryCache.set(fullKey, {
          data,
          expiresAt: Date.now() + (cacheTTL * 1000),
          hitCount: 0,
        });
      }
      
      logger.debug('Cache set successful', { key: fullKey, ttl: cacheTTL });
    } catch (error) {
      logger.error('Cache set error', { key: fullKey, error });
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const fullPattern = this.getKey(pattern);

    try {
      if (this.redis) {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      } else {
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern)) {
            this.memoryCache.delete(key);
          }
        }
      }
      
      logger.info('Cache invalidated', { pattern: fullPattern });
    } catch (error) {
      logger.error('Cache invalidation error', { pattern: fullPattern, error });
    }
  }

  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage?: string;
    hitRate?: number;
  }> {
    try {
      if (this.redis) {
        const info = await this.redis.info('memory');
        const keyCount = await this.redis.dbSize();
        
        return {
          totalKeys: keyCount,
          memoryUsage: info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown',
        };
      } else {
        return {
          totalKeys: this.memoryCache.size,
          memoryUsage: `${this.memoryCache.size} items`,
        };
      }
    } catch (error) {
      logger.error('Failed to get cache stats', { error });
      return { totalKeys: 0 };
    }
  }
}
```

## 4. API Route Implementation

### 4.1 Enhanced YouTube API Route

**File: `src/app/api/youtube/videos/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { YouTubeClient } from '@/services/youtube/client';
import { CacheManager } from '@/services/cache/manager';
import { validateMultipleEnvVars } from '@/utils/env-validation';
import { logger } from '@/utils/logger';
import { z } from 'zod';

const QuerySchema = z.object({
  maxResults: z.coerce.number().min(1).max(50).optional(),
  order: z.enum(['date', 'relevance', 'viewCount']).optional(),
  publishedAfter: z.string().optional(),
  pageToken: z.string().optional(),
  forceRefresh: z.coerce.boolean().optional(),
});

const cache = new CacheManager();
let youtubeClient: YouTubeClient | null = null;

function getYouTubeClient(): YouTubeClient {
  if (!youtubeClient) {
    const envVars = {
      'YOUTUBE_API_KEY': process.env.YOUTUBE_API_KEY,
      'YOUTUBE_CHANNEL_ID': process.env.YOUTUBE_CHANNEL_ID,
    };

    const validation = validateMultipleEnvVars(envVars);
    if (!validation.isAllValid) {
      throw new Error('YouTube API not configured properly');
    }

    youtubeClient = new YouTubeClient({
      apiKey: process.env.YOUTUBE_API_KEY!,
      channelId: process.env.YOUTUBE_CHANNEL_ID!,
      maxResults: parseInt(process.env.YOUTUBE_MAX_RESULTS || '10'),
      timeout: parseInt(process.env.YOUTUBE_REQUEST_TIMEOUT || '10000'),
    });
  }
  return youtubeClient;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));
    
    logger.info('YouTube videos API request', { query });

    // Generate cache key based on query parameters
    const cacheKey = `videos:${JSON.stringify(query)}`;
    
    // Check cache first (unless force refresh)
    if (!query.forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.info('Returning cached YouTube videos', {
          cacheInfo: cached.cacheInfo,
          responseTime: Date.now() - startTime,
        });
        
        return NextResponse.json({
          ...cached.data,
          cacheInfo: cached.cacheInfo,
          responseTime: Date.now() - startTime,
        });
      }
    }

    // Fetch from YouTube API
    const client = getYouTubeClient();
    const result = await client.fetchVideos(query);
    
    // Cache the result
    const cacheTTL = parseInt(process.env.YOUTUBE_CACHE_TTL || '600');
    await cache.set(cacheKey, result, cacheTTL);
    
    const responseTime = Date.now() - startTime;
    
    logger.info('YouTube videos fetched successfully', {
      count: result.items.length,
      totalResults: result.totalResults,
      responseTime,
    });

    return NextResponse.json({
      ...result,
      cacheInfo: {
        cached: false,
        ttl: cacheTTL,
        lastUpdated: new Date().toISOString(),
      },
      responseTime,
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error('YouTube videos API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    });

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        {
          error: 'Configuration Error',
          message: 'YouTube API is not properly configured',
          details: 'Please check your YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID environment variables',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'YouTube API Error',
        message: error instanceof Error ? error.message : 'Failed to fetch YouTube videos',
        responseTime,
      },
      { status: 500 }
    );
  }
}
```

### 4.2 Health Check API Route

**File: `src/app/api/youtube/health/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { YouTubeClient } from '@/services/youtube/client';
import { CacheManager } from '@/services/cache/manager';
import { validateMultipleEnvVars } from '@/utils/env-validation';
import { logger } from '@/utils/logger';

const cache = new CacheManager();

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check cache for recent health status
    const cached = await cache.get('health:status');
    if (cached && cached.cacheInfo.ttl > 30) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        responseTime: Date.now() - startTime,
      });
    }

    const services: any[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'down' = 'healthy';

    // Check YouTube API configuration
    const envVars = {
      'YOUTUBE_API_KEY': process.env.YOUTUBE_API_KEY,
      'YOUTUBE_CHANNEL_ID': process.env.YOUTUBE_CHANNEL_ID,
    };

    const validation = validateMultipleEnvVars(envVars);
    
    if (validation.isAllValid) {
      // Test YouTube API connectivity
      try {
        const client = new YouTubeClient({
          apiKey: process.env.YOUTUBE_API_KEY!,
          channelId: process.env.YOUTUBE_CHANNEL_ID!,
        });
        
        const healthCheck = await client.healthCheck();
        services.push({
          name: 'youtube',
          ...healthCheck,
          lastCheck: new Date().toISOString(),
        });
        
        if (healthCheck.status !== 'healthy') {
          overallStatus = healthCheck.status;
        }
      } catch (error) {
        services.push({
          name: 'youtube',
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString(),
        });
        overallStatus = 'down';
      }
    } else {
      services.push({
        name: 'youtube',
        status: 'down',
        error: 'Configuration invalid',
        details: validation.errors,
        lastCheck: new Date().toISOString(),
      });
      overallStatus = 'down';
    }

    // Check cache service
    try {
      const cacheStats = await cache.getStats();
      services.push({
        name: 'cache',
        status: 'healthy',
        stats: cacheStats,
        lastCheck: new Date().toISOString(),
      });
    } catch (error) {
      services.push({
        name: 'cache',
        status: 'degraded',
        error: 'Cache service issues',
        lastCheck: new Date().toISOString(),
      });
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }

    const healthData = {
      status: overallStatus,
      services,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };

    // Cache health status for 1 minute
    await cache.set('health:status', healthData, 60);

    logger.info('Health check completed', {
      status: overallStatus,
      serviceCount: services.length,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(healthData);
    
  } catch (error) {
    logger.error('Health check failed', { error });
    
    return NextResponse.json(
      {
        status: 'down',
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
```

## 5. Frontend Component Implementation

### 5.1 Enhanced Streams Component

**File: `src/components/sections/StreamsRedesigned.tsx`**
```typescript
"use client";
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { AlertCircle, RefreshCw, Play, Clock, Eye } from 'lucide-react';
import { logger } from '@/utils/logger';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
  tags: string[];
  url: string;
}

interface ApiResponse {
  items: VideoItem[];
  nextPageToken?: string;
  totalResults: number;
  cacheInfo: {
    cached: boolean;
    ttl: number;
    lastUpdated: string;
    hitCount?: number;
  };
  responseTime: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  services: Array<{
    name: string;
    status: string;
    error?: string;
    responseTime?: number;
  }>;
  responseTime: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function StreamsRedesigned() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    order: 'date' as 'date' | 'relevance' | 'viewCount',
    maxResults: 12,
  });

  // Fetch videos with SWR
  const { 
    data: videosData, 
    error: videosError, 
    isLoading: videosLoading,
    mutate: refreshVideos 
  } = useSWR<ApiResponse>(
    `/api/youtube/videos?${new URLSearchParams({
      order: filters.order,
      maxResults: filters.maxResults.toString(),
    })}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  // Fetch health status
  const { data: healthData } = useSWR<HealthStatus>(
    '/api/youtube/health',
    fetcher,
    {
      refreshInterval: 60000, // 1 minute
      revalidateOnFocus: false,
    }
  );

  const handleVideoClick = useCallback((video: VideoItem) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    
    logger.info('Video selected', {
      videoId: video.id,
      title: video.title,
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    logger.info('Manual refresh triggered');
    await refreshVideos();
  }, [refreshVideos]);

  const formatDuration = (publishedAt: string) => {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <section id="streams" className="min-h-screen py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">YouTube Streams</h2>
            <p className="text-gray-400">Latest videos from my YouTube channel</p>
          </div>
          
          {/* Health Status */}
          {healthData && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                healthData.status === 'healthy' ? 'bg-green-400' : 
                healthData.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <span className={`text-sm ${getStatusColor(healthData.status)}`}>
                {healthData.status}
              </span>
              <span className="text-gray-500 text-xs">({healthData.responseTime}ms)</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <select
              value={filters.order}
              onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value as any }))}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="date">Latest</option>
              <option value="viewCount">Most Viewed</option>
              <option value="relevance">Most Relevant</option>
            </select>
            
            <select
              value={filters.maxResults}
              onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value={6}>6 videos</option>
              <option value={12}>12 videos</option>
              <option value={24}>24 videos</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={videosLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${videosLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Cache Info */}
        {videosData?.cacheInfo && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {videosData.cacheInfo.cached ? '🟢 Cached' : '🔴 Fresh'} • 
                TTL: {videosData.cacheInfo.ttl}s • 
                Response: {videosData.responseTime}ms
                {videosData.cacheInfo.hitCount && ` • Hits: ${videosData.cacheInfo.hitCount}`}
              </span>
              <span className="text-gray-500">
                Updated: {new Date(videosData.cacheInfo.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {videosError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-red-400 font-medium">Failed to Load Videos</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {videosError.message || 'Unable to fetch YouTube videos'}
            </p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {videosLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: filters.maxResults }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-700" />
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Videos Grid */}
        {videosData && !videosLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videosData.items.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.publishedAt)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Modal */}
        {isModalOpen && selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="text-white font-medium truncate">{selectedVideo.title}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <p className="text-gray-300 text-sm mb-2">{selectedVideo.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Published: {new Date(selectedVideo.publishedAt).toLocaleDateString()}</span>
                  <span>Channel: {selectedVideo.channelTitle}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

## 6. Testing Implementation

### 6.1 Unit Tests

**File: `src/services/youtube/__tests__/client.test.ts`**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YouTubeClient } from '../client';

// Mock fetch
global.fetch = vi.fn();

describe('YouTubeClient', () => {
  let client: YouTubeClient;
  
  beforeEach(() => {
    client = new YouTubeClient({
      apiKey: 'test-api-key',
      channelId: 'test-channel-id',
    });
    vi.clearAllMocks();
  });

  it('should fetch videos successfully', async () => {
    const mockResponse = {
      items: [
        {
          id: { videoId: 'test-video-id' },
          snippet: {
            title: 'Test Video',
            description: 'Test Description',
            publishedAt: '2023-12-01T10:00:00Z',
            thumbnails: {
              high: { url: 'https://example.com/thumb.jpg' }
            },
            channelTitle: 'Test Channel',
            tags: ['test', 'video']
          }
        }
      ],
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await client.fetchVideos();
    
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('test-video-id');
    expect(result.items[0].title).toBe('Test Video');
    expect(result.totalResults).toBe(1);
  });

  it('should handle API errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve('Forbidden')
    });

    await expect(client.fetchVideos()).rejects.toThrow('YouTube API error: 403');
  });

  it('should handle network timeouts', async () => {
    const client = new YouTubeClient({
      apiKey: 'test-api-key',
      channelId: 'test-channel-id',
      timeout: 100
    });

    (fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 200))
    );

    await expect(client.fetchVideos()).rejects.toThrow();
  });
});
```

## 7. Deployment Checklist

### 7.1 Environment Variables
```bash
# Production Environment Setup
YOUTUBE_API_KEY=your_production_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
REDIS_URL=your_redis_connection_string
YOUTUBE_CACHE_TTL=600
YOUTUBE_MAX_RESULTS=50
YOUTUBE_REQUEST_TIMEOUT=10000
ANALYTICS_ENABLED=true
```

### 7.2 Performance Monitoring
- Set up Redis monitoring
- Configure API quota alerts
- Monitor response times
- Track cache hit rates
- Set up error alerting

### 7.3 Security Considerations
- API key rotation strategy
- Rate limiting implementation
- Input validation on all endpoints
- CORS configuration
- Error message sanitization

This implementation guide provides a complete foundation for the YouTube streaming system redesign with modern architecture, comprehensive error handling, and production-ready features.
