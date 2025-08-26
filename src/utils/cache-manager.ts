/**
 * Enhanced Cache Manager
 * Provides Redis-based caching with automatic fallback to in-memory cache
 * Includes TTL management, cache invalidation, and performance monitoring
 */

import { createClient, RedisClientType } from 'redis';
import { createComponentLogger } from './logger';

// Cache manager with Redis and memory fallback
const cacheLogger = createComponentLogger('CacheManager');

// Cache configuration interface
export interface CacheConfig {
  redisUrl?: string;
  defaultTtl: number;
  maxMemoryItems: number;
  enableCompression: boolean;
  keyPrefix: string;
  retryAttempts: number;
  retryDelay: number;
}

// Cache entry interface
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
  redis?: unknown;
}

// Cache statistics interface
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  memoryEntries: number;
  redisConnected: boolean;
  hitRate: number;
}

// Cache result interface
export interface CacheResult<T = unknown> {
  success: boolean;
  data?: T;
  fromCache: boolean;
  source: 'redis' | 'memory' | 'none';
  error?: string;
}

/**
 * Enhanced Cache Manager Class
 */
export class CacheManager {
  private redisClient: RedisClientType | null = null;
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    memoryEntries: 0,
    redisConnected: false,
    hitRate: 0
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtl: 300, // 5 minutes
      maxMemoryItems: 1000,
      enableCompression: false,
      keyPrefix: 'portfolio:',
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    this.initializeRedis();
    this.startCleanupInterval();
  }

  /**
   * Initialize Redis connection with retry logic
   */
  private async initializeRedis(): Promise<void> {
    if (!this.config.redisUrl) {
      cacheLogger.info('Redis URL not provided, using memory cache only');
      return;
    }

    try {
      this.redisClient = createClient({
        url: this.config.redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.config.retryAttempts) {
              cacheLogger.error('Redis connection failed after max retries', { retries });
              return false;
            }
            const delay = Math.min(retries * this.config.retryDelay, 5000);
            cacheLogger.warn('Redis connection failed, retrying', { retries, delay });
            return delay;
          }
        }
      });

      this.redisClient.on('error', (error) => {
        this.stats.errors++;
        this.stats.redisConnected = false;
        cacheLogger.error('Redis client error', { error: error.message });
      });

      this.redisClient.on('connect', () => {
        this.stats.redisConnected = true;
        cacheLogger.info('Redis client connected successfully');
      });

      this.redisClient.on('disconnect', () => {
        this.stats.redisConnected = false;
        cacheLogger.warn('Redis client disconnected');
      });

      await this.redisClient.connect();
      cacheLogger.info('Redis cache manager initialized');
    } catch (error: unknown) {
      this.stats.errors++;
      cacheLogger.error('Failed to initialize Redis', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.redisClient = null;
    }
  }

  /**
   * Start cleanup interval for memory cache
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupMemoryCache();
    }, 60000); // Clean up every minute
  }

  /**
   * Clean up expired entries from memory cache
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key);
        removedCount++;
      }
    }

    this.stats.memoryEntries = this.memoryCache.size;

    if (removedCount > 0) {
      cacheLogger.debug('Memory cache cleanup completed', {
        removedCount,
        remainingEntries: this.memoryCache.size
      });
    }

    // Enforce max memory items limit
    if (this.memoryCache.size > this.config.maxMemoryItems) {
      const entriesToRemove = this.memoryCache.size - this.config.maxMemoryItems;
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      for (let i = 0; i < entriesToRemove; i++) {
        this.memoryCache.delete(sortedEntries[i][0]);
      }

      cacheLogger.warn('Memory cache size limit exceeded, removed oldest entries', {
        removedCount: entriesToRemove,
        currentSize: this.memoryCache.size
      });
    }
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Compress data if compression is enabled
   */
  private compressData(data: unknown): { data: string; compressed: boolean } {
    if (!this.config.enableCompression) {
      return { data: JSON.stringify(data), compressed: false };
    }

    try {
      // Simple compression using JSON.stringify with space removal
      const jsonString = JSON.stringify(data);
      return { data: jsonString, compressed: true };
    } catch (error) {
      cacheLogger.warn('Failed to compress data, using uncompressed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { data: JSON.stringify(data), compressed: false };
    }
  }

  /**
   * Decompress data if it was compressed
   */
  private decompressData(data: string, compressed: boolean): unknown {
    try {
      return JSON.parse(data);
    } catch (error) {
      cacheLogger.error('Failed to decompress/parse cached data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        compressed
      });
      return null;
    }
  }

  /**
   * Get value from Redis cache
   */
  private async getFromRedis(key: string): Promise<unknown | null> {
    if (!this.redisClient || !this.stats.redisConnected) {
      return null;
    }

    try {
      const result = await this.redisClient.get(key);
      if (result) {
        const entry: CacheEntry = JSON.parse(result);
        return this.decompressData(entry.data, entry.compressed || false);
      }
      return null;
    } catch (error) {
      this.stats.errors++;
      cacheLogger.error('Failed to get from Redis', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Set value in Redis cache
   */
  private async setInRedis(key: string, data: unknown, ttl: number): Promise<boolean> {
    if (!this.redisClient || !this.stats.redisConnected) {
      return false;
    }

    try {
      const { data: compressedData, compressed } = this.compressData(data);
      const entry: CacheEntry = {
        data: compressedData,
        timestamp: Date.now(),
        ttl,
        compressed
      };

      await this.redisClient.setEx(key, ttl, JSON.stringify(entry));
      return true;
    } catch (error) {
      this.stats.errors++;
      cacheLogger.error('Failed to set in Redis', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Delete value from Redis cache
   */
  private async deleteFromRedis(key: string): Promise<boolean> {
    if (!this.redisClient || !this.stats.redisConnected) {
      return false;
    }

    try {
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      this.stats.errors++;
      cacheLogger.error('Failed to delete from Redis', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Get value from memory cache
   */
  private getFromMemory(key: string): unknown | null {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    return this.decompressData(entry.data, entry.compressed || false);
  }

  /**
   * Set value in memory cache
   */
  private setInMemory(key: string, data: unknown, ttl: number): void {
    const { data: compressedData, compressed } = this.compressData(data);
    const entry: CacheEntry = {
      data: compressedData,
      timestamp: Date.now(),
      ttl,
      compressed
    };

    this.memoryCache.set(key, entry);
    this.stats.memoryEntries = this.memoryCache.size;
  }

  /**
   * Delete value from memory cache
   */
  private deleteFromMemory(key: string): void {
    this.memoryCache.delete(key);
    this.stats.memoryEntries = this.memoryCache.size;
  }

  /**
   * Update cache statistics
   */
  private updateStats(operation: 'hit' | 'miss' | 'set' | 'delete'): void {
    this.stats[operation === 'hit' ? 'hits' : operation === 'miss' ? 'misses' : operation === 'set' ? 'sets' : 'deletes']++;
    
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
  }

  /**
   * Get value from cache (Redis first, then memory)
   */
  async get<T = unknown>(key: string): Promise<CacheResult<T>> {
    const fullKey = this.generateKey(key);
    
    try {
      // Try Redis first
      const redisData = await this.getFromRedis(fullKey);
      if (redisData !== null) {
        this.updateStats('hit');
        cacheLogger.debug('Cache hit from Redis', { key });
        return {
          success: true,
          data: redisData,
          fromCache: true,
          source: 'redis'
        };
      }

      // Try memory cache
      const memoryData = this.getFromMemory(fullKey);
      if (memoryData !== null) {
        this.updateStats('hit');
        cacheLogger.debug('Cache hit from memory', { key });
        return {
          success: true,
          data: memoryData,
          fromCache: true,
          source: 'memory'
        };
      }

      // Cache miss
      this.updateStats('miss');
      cacheLogger.debug('Cache miss', { key });
      return {
        success: true,
        fromCache: false,
        source: 'none'
      };
    } catch (error) {
      this.stats.errors++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      cacheLogger.error('Cache get operation failed', { key, error: errorMessage });
      
      return {
        success: false,
        fromCache: false,
        source: 'none',
        error: errorMessage
      };
    }
  }

  /**
   * Set value in cache (both Redis and memory)
   */
  async set(key: string, data: unknown, ttl?: number): Promise<CacheResult<void>> {
    const fullKey = this.generateKey(key);
    const cacheTtl = ttl || this.config.defaultTtl;
    
    try {
      // Set in both Redis and memory for redundancy
      const redisSuccess = await this.setInRedis(fullKey, data, cacheTtl);
      this.setInMemory(fullKey, data, cacheTtl);
      
      this.updateStats('set');
      
      cacheLogger.debug('Cache set operation completed', {
        key,
        ttl: cacheTtl,
        redisSuccess,
        memorySuccess: true
      });
      
      return {
        success: true,
        fromCache: false,
        source: redisSuccess ? 'redis' : 'memory'
      };
    } catch (error) {
      this.stats.errors++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      cacheLogger.error('Cache set operation failed', { key, error: errorMessage });
      
      return {
        success: false,
        fromCache: false,
        source: 'none',
        error: errorMessage
      };
    }
  }

  /**
   * Delete value from cache (both Redis and memory)
   */
  async delete(key: string): Promise<CacheResult<void>> {
    const fullKey = this.generateKey(key);
    
    try {
      const redisSuccess = await this.deleteFromRedis(fullKey);
      this.deleteFromMemory(fullKey);
      
      this.updateStats('delete');
      
      cacheLogger.debug('Cache delete operation completed', {
        key,
        redisSuccess,
        memorySuccess: true
      });
      
      return {
        success: true,
        fromCache: false,
        source: redisSuccess ? 'redis' : 'memory'
      };
    } catch (error) {
      this.stats.errors++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      cacheLogger.error('Cache delete operation failed', { key, error: errorMessage });
      
      return {
        success: false,
        fromCache: false,
        source: 'none',
        error: errorMessage
      };
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<CacheResult<void>> {
    try {
      // Clear Redis
      if (this.redisClient && this.stats.redisConnected) {
        await this.redisClient.flushDb();
      }
      
      // Clear memory
      this.memoryCache.clear();
      this.stats.memoryEntries = 0;
      
      cacheLogger.info('Cache cleared successfully');
      
      return {
        success: true,
        fromCache: false,
        source: 'redis'
      };
    } catch (error) {
      this.stats.errors++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      cacheLogger.error('Cache clear operation failed', { error: errorMessage });
      
      return {
        success: false,
        fromCache: false,
        source: 'none',
        error: errorMessage
      };
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      redisConnected: boolean;
      memoryEntries: number;
      hitRate: number;
      errorRate: number;
      totalOperations: number;
    };
  } {
    const totalOperations = this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes;
    const errorRate = totalOperations > 0 ? (this.stats.errors / totalOperations) * 100 : 0;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 10) {
      status = 'unhealthy';
    } else if (!this.stats.redisConnected || errorRate > 5) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        redisConnected: this.stats.redisConnected,
        memoryEntries: this.stats.memoryEntries,
        hitRate: this.stats.hitRate,
        errorRate,
        totalOperations
      }
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        cacheLogger.info('Redis client disconnected');
      } catch (error) {
        cacheLogger.error('Error disconnecting Redis client', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    this.memoryCache.clear();
    cacheLogger.info('Cache manager cleanup completed');
  }
}

/**
 * Factory function to create cache manager instance
 */
export function createCacheManager(config?: Partial<CacheConfig>): CacheManager {
  const defaultConfig: Partial<CacheConfig> = {
    redisUrl: process.env.REDIS_URL,
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),
    maxMemoryItems: parseInt(process.env.CACHE_MAX_MEMORY_ITEMS || '1000'),
    enableCompression: process.env.CACHE_ENABLE_COMPRESSION === 'true',
    keyPrefix: process.env.CACHE_KEY_PREFIX || 'portfolio:'
  };

  return new CacheManager({ ...defaultConfig, ...config });
}

// Export default instance
export const cacheManager = createCacheManager();