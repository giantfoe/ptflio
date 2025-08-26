/**
 * Enhanced YouTube Service Client
 * Provides robust YouTube Data API v3 integration with comprehensive error handling,
 * validation, and performance monitoring.
 */

// YouTube service client with enhanced error handling
import { validateEnvVar, ValidationResult } from './env-validation';
import { mapYoutubeResponse, YouTubeResponse } from './mapYoutube';
import { createComponentLogger } from './logger';

// Service logger
const serviceLogger = createComponentLogger('YouTubeService');

// Configuration interface
export interface YouTubeConfig {
  apiKey: string;
  channelId: string;
  maxResults?: number;
  order?: 'date' | 'relevance' | 'rating' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'any' | 'long' | 'medium' | 'short';
  videoDefinition?: 'any' | 'high' | 'standard';
  safeSearch?: 'moderate' | 'none' | 'strict';
}

// API Response interfaces
export interface YouTubeApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface YouTubeApiResponse {
  success: boolean;
  data?: unknown;
  error?: YouTubeApiError;
  metadata?: {
    requestId: string;
    timestamp: number;
    cached: boolean;
    source: string;
  };
}

// Service result interfaces
export interface YouTubeServiceResult {
  success: boolean;
  data?: unknown[];
  error?: {
    type: 'CONFIGURATION' | 'API' | 'NETWORK' | 'VALIDATION' | 'RATE_LIMIT' | 'UNKNOWN';
    message: string;
    code?: number;
    details?: unknown;
  };
  metadata?: {
    totalResults: number;
    resultsPerPage: number;
    nextPageToken?: string;
    prevPageToken?: string;
    requestDuration: number;
    cacheHit?: boolean;
  };
}

// Rate limiting configuration
interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
  backoffMultiplier: number;
  maxRetries: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequestsPerMinute: 100,
  maxRequestsPerDay: 10000,
  backoffMultiplier: 2,
  maxRetries: 3
};

// Request tracking for rate limiting
interface RequestTracker {
  requests: number[];
  dailyRequests: number;
  lastReset: number;
}

const requestTracker: RequestTracker = {
  requests: [],
  dailyRequests: 0,
  lastReset: Date.now()
};

/**
 * Enhanced YouTube Service Class
 */
export class YouTubeService {
  private config: YouTubeConfig;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private rateLimitConfig: RateLimitConfig;

  constructor(config: YouTubeConfig, rateLimitConfig?: Partial<RateLimitConfig>) {
    this.config = {
      maxResults: 10,
      order: 'date',
      safeSearch: 'moderate',
      ...config
    };
    this.rateLimitConfig = { ...DEFAULT_RATE_LIMIT, ...rateLimitConfig };
  }

  /**
   * Validates the YouTube service configuration
   */
  validateConfiguration(): ValidationResult {
    const apiKeyValidation = validateEnvVar(this.config.apiKey, 'YOUTUBE_API_KEY');
    if (!apiKeyValidation.isValid) {
      return apiKeyValidation;
    }

    const channelIdValidation = validateEnvVar(this.config.channelId, 'YOUTUBE_CHANNEL_ID');
    if (!channelIdValidation.isValid) {
      return channelIdValidation;
    }

    // Additional validation for API key format
    if (!this.config.apiKey.startsWith('AIza') || this.config.apiKey.length !== 39) {
      return {
        isValid: false,
        error: 'Invalid YouTube API key format',
        suggestion: 'YouTube API keys should start with "AIza" and be 39 characters long'
      };
    }

    // Validate channel ID format
    if (!this.config.channelId.startsWith('UC') || this.config.channelId.length !== 24) {
      return {
        isValid: false,
        error: 'Invalid YouTube channel ID format',
        suggestion: 'YouTube channel IDs should start with "UC" and be 24 characters long'
      };
    }

    return { isValid: true };
  }

  /**
   * Checks rate limiting before making requests
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Reset daily counter if needed
    if (now - requestTracker.lastReset > 86400000) {
      requestTracker.dailyRequests = 0;
      requestTracker.lastReset = now;
    }

    // Clean old requests from tracker
    requestTracker.requests = requestTracker.requests.filter(time => time > oneMinuteAgo);

    // Check limits
    const minuteRequests = requestTracker.requests.length;
    const dailyRequests = requestTracker.dailyRequests;

    if (minuteRequests >= this.rateLimitConfig.maxRequestsPerMinute) {
      serviceLogger.warn('Rate limit exceeded: too many requests per minute', {
        minuteRequests,
        limit: this.rateLimitConfig.maxRequestsPerMinute
      });
      return false;
    }

    if (dailyRequests >= this.rateLimitConfig.maxRequestsPerDay) {
      serviceLogger.warn('Rate limit exceeded: too many requests per day', {
        dailyRequests,
        limit: this.rateLimitConfig.maxRequestsPerDay
      });
      return false;
    }

    return true;
  }

  /**
   * Records a request for rate limiting
   */
  private recordRequest(): void {
    const now = Date.now();
    requestTracker.requests.push(now);
    requestTracker.dailyRequests++;
  }

  /**
   * Builds the YouTube API URL with parameters
   */
  private buildApiUrl(endpoint: string, params: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    
    // Add API key
    url.searchParams.set('key', this.config.apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  /**
   * Makes HTTP request with retry logic and error handling
   */
  private async makeRequest(url: string, retryCount = 0): Promise<unknown> {
    const startTime = Date.now();
    
    try {
      serviceLogger.debug('Making YouTube API request', {
        url: url.replace(this.config.apiKey, '[REDACTED]'),
        retryCount
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-YouTube-Client/1.0'
        }
      });

      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        serviceLogger.error('YouTube API request failed', {
          status: response.status,
          statusText: response.statusText,
          duration,
          retryCount,
          errorData
        });

        // Handle specific error codes
        if (response.status === 403) {
          throw new Error(`YouTube API access forbidden: ${errorData.error?.message || 'Invalid API key or quota exceeded'}`);
        }
        
        if (response.status === 400) {
          throw new Error(`YouTube API bad request: ${errorData.error?.message || 'Invalid parameters'}`);
        }
        
        if (response.status === 429) {
          // Rate limited - implement exponential backoff
          if (retryCount < this.rateLimitConfig.maxRetries) {
            const backoffDelay = Math.pow(this.rateLimitConfig.backoffMultiplier, retryCount) * 1000;
            serviceLogger.warn('Rate limited, retrying after backoff', {
              retryCount,
              backoffDelay,
              duration
            });
            
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            return this.makeRequest(url, retryCount + 1);
          }
          
          throw new Error('YouTube API rate limit exceeded');
        }

        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      serviceLogger.info('YouTube API request successful', {
        duration,
        itemCount: data.items?.length || 0,
        totalResults: data.pageInfo?.totalResults || 0
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof Error && retryCount < this.rateLimitConfig.maxRetries) {
        // Retry on network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          const backoffDelay = Math.pow(this.rateLimitConfig.backoffMultiplier, retryCount) * 1000;
          
          serviceLogger.warn('Network error, retrying after backoff', {
            error: error.message,
            retryCount,
            backoffDelay,
            duration
          });
          
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.makeRequest(url, retryCount + 1);
        }
      }

      serviceLogger.error('YouTube API request failed permanently', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        retryCount
      });
      
      throw error;
    }
  }

  /**
   * Fetches videos from a YouTube channel
   */
  async getChannelVideos(options: {
    maxResults?: number;
    pageToken?: string;
    publishedAfter?: string;
    publishedBefore?: string;
  } = {}): Promise<YouTubeServiceResult> {
    const startTime = Date.now();
    
    try {
      // Validate configuration
      const configValidation = this.validateConfiguration();
      if (!configValidation.isValid) {
        return {
          success: false,
          error: {
            type: 'CONFIGURATION',
            message: configValidation.error!,
            details: { suggestion: configValidation.suggestion }
          }
        };
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: {
            type: 'RATE_LIMIT',
            message: 'Rate limit exceeded. Please try again later.',
            details: {
              maxRequestsPerMinute: this.rateLimitConfig.maxRequestsPerMinute,
              maxRequestsPerDay: this.rateLimitConfig.maxRequestsPerDay
            }
          }
        };
      }

      // Record the request
      this.recordRequest();

      // Build API parameters
      const params = {
        part: 'snippet',
        channelId: this.config.channelId,
        type: 'video',
        order: this.config.order!,
        maxResults: (options.maxResults || this.config.maxResults!).toString(),
        safeSearch: this.config.safeSearch!,
        ...(options.pageToken && { pageToken: options.pageToken }),
        ...(options.publishedAfter && { publishedAfter: options.publishedAfter }),
        ...(options.publishedBefore && { publishedBefore: options.publishedBefore }),
        ...(this.config.videoDuration && { videoDuration: this.config.videoDuration }),
        ...(this.config.videoDefinition && { videoDefinition: this.config.videoDefinition })
      };

      // Build URL and make request
      const url = this.buildApiUrl('search', params);
      const apiResponse = await this.makeRequest(url) as YouTubeResponse;

      // Map the response
      const mappedData = mapYoutubeResponse(apiResponse);
      const requestDuration = Date.now() - startTime;

      serviceLogger.info('YouTube channel videos fetched successfully', {
        channelId: this.config.channelId,
        itemCount: mappedData.length,
        totalResults: apiResponse.pageInfo?.totalResults || 0,
        requestDuration
      });

      return {
        success: true,
        data: mappedData,
        metadata: {
          totalResults: apiResponse.pageInfo?.totalResults || 0,
          resultsPerPage: apiResponse.pageInfo?.resultsPerPage || 0,
          nextPageToken: apiResponse.nextPageToken,
          prevPageToken: apiResponse.prevPageToken,
          requestDuration
        }
      };
    } catch (error) {
      const requestDuration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      serviceLogger.error('Failed to fetch YouTube channel videos', {
        channelId: this.config.channelId,
        error: errorMessage,
        requestDuration
      });

      // Determine error type
      let errorType: YouTubeServiceResult['error']['type'] = 'UNKNOWN';
      if (errorMessage.includes('forbidden') || errorMessage.includes('API key')) {
        errorType = 'API';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'NETWORK';
      } else if (errorMessage.includes('rate limit')) {
        errorType = 'RATE_LIMIT';
      }

      return {
        success: false,
        error: {
          type: errorType,
          message: errorMessage,
          details: { requestDuration }
        }
      };
    }
  }

  /**
   * Gets service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      configurationValid: boolean;
      rateLimitStatus: {
        withinLimits: boolean;
        requestsThisMinute: number;
        requestsToday: number;
      };
      lastError?: string;
    };
  }> {
    const configValidation = this.validateConfiguration();
    const withinRateLimit = this.checkRateLimit();
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const requestsThisMinute = requestTracker.requests.filter(time => time > oneMinuteAgo).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!configValidation.isValid) {
      status = 'unhealthy';
    } else if (!withinRateLimit) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        configurationValid: configValidation.isValid,
        rateLimitStatus: {
          withinLimits: withinRateLimit,
          requestsThisMinute,
          requestsToday: requestTracker.dailyRequests
        },
        ...(configValidation.error && { lastError: configValidation.error })
      }
    };
  }
}

/**
 * Factory function to create YouTube service instance
 */
export function createYouTubeService(config?: Partial<YouTubeConfig>): YouTubeService {
  const defaultConfig: YouTubeConfig = {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || '',
    maxResults: parseInt(process.env.YOUTUBE_MAX_RESULTS || '10'),
    order: (process.env.YOUTUBE_ORDER as 'date' | 'relevance' | 'rating' | 'title' | 'videoCount' | 'viewCount') || 'date',
    safeSearch: (process.env.YOUTUBE_SAFE_SEARCH as 'moderate' | 'none' | 'strict') || 'moderate'
  };

  return new YouTubeService({ ...defaultConfig, ...config });
}

// Export default instance
export const youtubeService = createYouTubeService();