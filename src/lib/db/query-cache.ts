/**
 * Query Caching System
 * ระบบแคชสำหรับ database queries
 */

import redis from './redis';
import logger from '@/lib/logger';
import { createHash } from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds, default 300 (5 minutes)
  prefix?: string; // Cache key prefix
  compress?: boolean; // Compress data before storing
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
}

export class QueryCache {
  private defaultTTL: number = 300; // 5 minutes
  private keyPrefix: string = 'query_cache:';
  private statsKey: string = 'cache_stats';

  constructor(options?: { defaultTTL?: number; keyPrefix?: string }) {
    if (options?.defaultTTL) this.defaultTTL = options.defaultTTL;
    if (options?.keyPrefix) this.keyPrefix = options.keyPrefix;
  }

  /**
   * Generate cache key from query and parameters
   */
  private generateKey(query: string, params?: unknown[]): string {
    const data = JSON.stringify({ query, params });
    const hash = createHash('md5').update(data).digest('hex');
    return `${this.keyPrefix}${hash}`;
  }

  /**
   * Get cached query result
   */
  async get<T = unknown>(query: string, params?: unknown[]): Promise<T | null> {
    try {
      const key = this.generateKey(query, params);
      const cached = await redis.get(key);
      
      if (cached) {
        await this.incrementHits();
        logger.debug('Cache hit', { key, query: query.substring(0, 100) });
        return JSON.parse(cached) as T;
      }
      
      await this.incrementMisses();
      logger.debug('Cache miss', { key, query: query.substring(0, 100) });
      return null;
    } catch (error) {
      logger.error('Cache get error', { error, query: query.substring(0, 100) });
      return null;
    }
  }

  /**
   * Set query result in cache
   */
  async set<T>(
    query: string, 
    params: unknown[], 
    result: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const key = this.generateKey(query, params);
      const ttl = options.ttl || this.defaultTTL;
      const value = JSON.stringify(result);
      
      await redis.setex(key, ttl, value);
      logger.debug('Cache set', { 
        key, 
        ttl, 
        query: query.substring(0, 100),
        dataSize: value.length 
      });
      
      return true;
    } catch (error) {
      logger.error('Cache set error', { error, query: query.substring(0, 100) });
      return false;
    }
  }

  /**
   * Delete cache entry
   */
  async del(query: string, params?: unknown[]): Promise<boolean> {
    try {
      const key = this.generateKey(query, params);
      const result = await redis.del(key);
      logger.debug('Cache delete', { key, query: query.substring(0, 100) });
      return result > 0;
    } catch (error) {
      logger.error('Cache delete error', { error, query: query.substring(0, 100) });
      return false;
    }
  }

  /**
   * Clear all cache entries with prefix
   */
  async clear(pattern?: string): Promise<number> {
    try {
      const searchPattern = pattern || `${this.keyPrefix}*`;
      const keys = await redis.keys(searchPattern);
      
      if (keys.length === 0) return 0;
      
      const result = await redis.del(...keys);
      logger.info('Cache cleared', { pattern: searchPattern, deletedKeys: result });
      return result;
    } catch (error) {
      logger.error('Cache clear error', { error, pattern });
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const hits = await redis.hget(this.statsKey, 'hits') || '0';
      const misses = await redis.hget(this.statsKey, 'misses') || '0';
      const hitCount = parseInt(hits, 10);
      const missCount = parseInt(misses, 10);
      const total = hitCount + missCount;
      const hitRate = total > 0 ? (hitCount / total) * 100 : 0;
      
      // Count total cache keys
      const keys = await redis.keys(`${this.keyPrefix}*`);
      
      return {
        hits: hitCount,
        misses: missCount,
        hitRate: Math.round(hitRate * 100) / 100,
        totalKeys: keys.length
      };
    } catch (error) {
      logger.error('Cache stats error', { error });
      return { hits: 0, misses: 0, hitRate: 0, totalKeys: 0 };
    }
  }

  /**
   * Reset cache statistics
   */
  async resetStats(): Promise<boolean> {
    try {
      await redis.del(this.statsKey);
      logger.info('Cache stats reset');
      return true;
    } catch (error) {
      logger.error('Cache stats reset error', { error });
      return false;
    }
  }

  /**
   * Check if cache is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Increment cache hits
   */
  private async incrementHits(): Promise<void> {
    try {
      await redis.hincrby(this.statsKey, 'hits', 1);
    } catch (error) {
      logger.error('Failed to increment cache hits', { error });
    }
  }

  /**
   * Increment cache misses
   */
  private async incrementMisses(): Promise<void> {
    try {
      await redis.hincrby(this.statsKey, 'misses', 1);
    } catch (error) {
      logger.error('Failed to increment cache misses', { error });
    }
  }

  /**
   * Cached query execution wrapper
   */
  async cached<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    params?: unknown[],
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(cacheKey, params);
    if (cached !== null) {
      return cached;
    }

    // Execute query
    const result = await queryFn();
    
    // Cache the result
    await this.set(cacheKey, params || [], result, options);
    
    return result;
  }
}

// Export singleton instance
export const queryCache = new QueryCache();

// Cache presets for different types of queries
export const CACHE_PRESETS = {
  SHORT: { ttl: 60 },        // 1 minute
  MEDIUM: { ttl: 300 },      // 5 minutes  
  LONG: { ttl: 1800 },       // 30 minutes
  VERY_LONG: { ttl: 3600 },  // 1 hour
  PERMANENT: { ttl: 86400 }  // 24 hours
} as const;