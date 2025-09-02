/**
 * Cache Management Utility for About Section APIs
 * Handles cache invalidation and management strategies
 */

import redis from "@/lib/db/redis";
import logger from "@/lib/logger";

// Cache keys used across About APIs
export const CACHE_KEYS = {
  ORGANIZATIONAL: "organizational:all",
  SOCIETY_COOP: "society:coop:all", 
  VISION: "vision:mission:values",
} as const;

// Cache expiry times in seconds
export const CACHE_EXPIRY = {
  ORGANIZATIONAL: 3600, // 1 hour
  SOCIETY_COOP: 3600,   // 1 hour
  VISION: 7200,         // 2 hours (changes less frequently)
} as const;

/**
 * Invalidate specific cache key
 */
export async function invalidateCache(key: string): Promise<boolean> {
  try {
    const result = await redis.del(key);
    logger.info(`Cache invalidated for key: ${key}`);
    return result > 0;
  } catch (error) {
    logger.error(`Failed to invalidate cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Invalidate all About section caches
 */
export async function invalidateAboutCaches(): Promise<{
  success: boolean;
  invalidated: string[];
  failed: string[];
}> {
  const cacheKeys: string[] = Object.values(CACHE_KEYS);
  const results = { success: true, invalidated: [] as string[], failed: [] as string[] };

  for (const key of cacheKeys) {
    try {
      const deleted = await redis.del(key);
      if (deleted > 0) {
        results.invalidated.push(key);
        logger.info(`Successfully invalidated cache: ${key}`);
      } else {
        logger.warn(`Cache key not found or already expired: ${key}`);
        results.invalidated.push(key); // Still count as success
      }
    } catch (error) {
      results.failed.push(key);
      results.success = false;
      logger.error(`Failed to invalidate ${key}:`, error);
    }
  }

  return results;
}

/**
 * Get cache status for all About section keys
 */
export async function getCacheStatus(): Promise<{
  [key: string]: {
    exists: boolean;
    ttl: number;
    size?: number;
  };
}> {
  const status: Record<string, { exists: boolean; ttl: number; size?: number }> = {};
  
  for (const [name, key] of Object.entries(CACHE_KEYS) as [string, string][]) {
    try {
      const exists = await redis.exists(key);
      const ttl = await redis.ttl(key);
      
      status[name] = {
        exists: exists === 1,
        ttl,
      };

      // Get size if cache exists
      if (exists === 1) {
        try {
          const data = await redis.get(key);
          status[name].size = data ? JSON.stringify(data).length : 0;
        } catch (sizeError) {
          logger.warn(`Failed to get cache size for ${key}:`, { error: sizeError });
        }
      }
    } catch (error) {
      logger.error(`Failed to check cache status for ${key}:`, error);
      status[name] = { exists: false, ttl: -1 };
    }
  }

  return status;
}

/**
 * Warm up cache by pre-loading data
 */
export async function warmUpCache(baseUrl: string): Promise<{
  success: boolean;
  warmedUp: string[];
  failed: string[];
}> {
  const endpoints = [
    { key: CACHE_KEYS.ORGANIZATIONAL, url: `${baseUrl}/api/(About)/Organizational` },
    { key: CACHE_KEYS.SOCIETY_COOP, url: `${baseUrl}/api/(About)/SocietyCoop` },
    { key: CACHE_KEYS.VISION, url: `${baseUrl}/api/(About)/Vision` },
  ];

  const results = { success: true, warmedUp: [] as string[], failed: [] as string[] };

  for (const endpoint of endpoints) {
    try {
      // Check if cache already exists
      const exists = await redis.exists(endpoint.key);
      if (exists === 1) {
        logger.info(`Cache already exists for ${endpoint.key}, skipping warm-up`);
        results.warmedUp.push(endpoint.key);
        continue;
      }

      // Fetch data to populate cache
      const response = await fetch(endpoint.url);
      if (response.ok) {
        results.warmedUp.push(endpoint.key);
        logger.info(`Successfully warmed up cache for ${endpoint.key}`);
      } else {
        results.failed.push(endpoint.key);
        results.success = false;
        logger.warn(`Failed to warm up cache for ${endpoint.key}: ${response.status}`);
      }
    } catch (error) {
      results.failed.push(endpoint.key);
      results.success = false;
      logger.error(`Error warming up cache for ${endpoint.key}:`, error);
    }
  }

  return results;
}

/**
 * Set cache with error handling
 */
export async function setCache(
  key: string, 
  data: unknown, 
  expiry: number
): Promise<boolean> {
  try {
    await redis.setex(key, expiry, JSON.stringify(data));
    logger.info(`Cache set successfully for key: ${key}`);
    return true;
  } catch (error) {
    logger.error(`Failed to set cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Get cache with error handling
 */
export async function getCache(key: string): Promise<unknown | null> {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    logger.error(`Failed to get cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Cache middleware for API routes
 */
export const cacheMiddleware = {
  get: async (key: string) => {
    const data = await getCache(key);
    return data;
  },
  
  set: async (key: string, data: unknown, expiry: number) => {
    return await setCache(key, data, expiry);
  },
  
  headers: (isHit: boolean, timestamp: string) => ({
    'X-Cache': isHit ? 'HIT' : 'MISS',
    'X-Cache-Time': timestamp,
  }),
};