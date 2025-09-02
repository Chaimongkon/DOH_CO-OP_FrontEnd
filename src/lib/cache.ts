/**
 * Advanced API Caching with SWR (Stale-While-Revalidate) Strategy
 * Provides intelligent caching, background updates, and offline support
 */

import logger from "./logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleTime?: number; // Time before data becomes stale
  maxAge?: number; // Maximum age before forced refresh
  retryCount?: number;
  retryDelay?: number;
}

class AdvancedCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private observers = new Map<string, Set<(data: unknown) => void>>();

  private defaultOptions: Required<CacheOptions> = {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleTime: 1 * 60 * 1000, // 1 minute
    maxAge: 30 * 60 * 1000, // 30 minutes
    retryCount: 3,
    retryDelay: 1000
  };

  /**
   * Fetch data with SWR strategy
   */
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if fresh
    if (cached && !this.isExpired(cached, now) && !cached.stale) {
      // Schedule background refresh if stale
      if (this.isStale(cached, now, opts.staleTime)) {
        this.scheduleRefresh(key, fetcher, opts);
      }
      return cached.data as T;
    }

    // Return stale data immediately, then fetch fresh data
    if (cached && cached.stale && this.pendingRequests.has(key)) {
      // Fresh request is already in progress, return stale data
      this.scheduleRefresh(key, fetcher, opts);
      return cached.data as T;
    }

    // Fetch fresh data
    return this.fetchFresh(key, fetcher, opts);
  }

  /**
   * Fetch fresh data from the source
   */
  private async fetchFresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Required<CacheOptions>
  ): Promise<T> {
    // Prevent duplicate requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)! as Promise<T>;
    }

    const request = this.executeWithRetry(fetcher, options);
    this.pendingRequests.set(key, request);

    try {
      const data = await request;
      const now = Date.now();

      // Update cache
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl: options.ttl,
        stale: false,
        key
      });

      // Notify observers
      this.notifyObservers(key, data);

      return data;
    } catch (error) {
      // Return stale data if available and error occurs
      const cached = this.cache.get(key);
      if (cached && !this.isExpired(cached, Date.now())) {
        return cached.data as T;
      }
      throw error;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Execute fetcher with retry logic
   */
  private async executeWithRetry<T>(
    fetcher: () => Promise<T>,
    options: Required<CacheOptions>
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= options.retryCount; attempt++) {
      try {
        return await fetcher();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < options.retryCount) {
          await this.delay(options.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Schedule background refresh
   */
  private scheduleRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Required<CacheOptions>
  ) {
    // Mark as stale
    const cached = this.cache.get(key);
    if (cached) {
      cached.stale = true;
    }

    // Schedule refresh
    setTimeout(async () => {
      try {
        await this.fetchFresh(key, fetcher, options);
      } catch {
        logger.warn(`Background refresh failed for ${key}:`);
      }
    }, 100);
  }

  /**
   * Subscribe to cache updates
   */
  subscribe<T>(key: string, callback: (data: T) => void): () => void {
    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }
    
    this.observers.get(key)!.add(callback as (data: unknown) => void);

    // Return unsubscribe function
    return () => {
      const observers = this.observers.get(key);
      if (observers) {
        observers.delete(callback as (data: unknown) => void);
        if (observers.size === 0) {
          this.observers.delete(key);
        }
      }
    };
  }

  /**
   * Notify observers of data changes
   */
  private notifyObservers(key: string, data: unknown) {
    const observers = this.observers.get(key);
    if (observers) {
      observers.forEach(callback => callback(data));
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let fresh = 0;
    let stale = 0;
    let expired = 0;

    this.cache.forEach(entry => {
      if (this.isExpired(entry, now)) {
        expired++;
      } else if (entry.stale) {
        stale++;
      } else {
        fresh++;
      }
    });

    return {
      total: this.cache.size,
      fresh,
      stale,
      expired,
      pending: this.pendingRequests.size
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<unknown>, now: number): boolean {
    return now - entry.timestamp > entry.ttl;
  }

  /**
   * Check if cache entry is stale
   */
  private isStale(entry: CacheEntry<unknown>, now: number, staleTime: number): boolean {
    return now - entry.timestamp > staleTime;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Preload data into cache
   */
  async preload<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ) {
    if (!this.cache.has(key)) {
      await this.fetch(key, fetcher, options);
    }
  }

  /**
   * Get cached data without fetching
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry, Date.now())) {
      return entry.data as T;
    }
    return null;
  }

  /**
   * Set data in cache manually
   */
  set<T>(key: string, data: T, options: CacheOptions = {}) {
    const opts = { ...this.defaultOptions, ...options };
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: opts.ttl,
      stale: false,
      key
    });

    this.notifyObservers(key, data);
  }
}

// Create global cache instance
export const apiCache = new AdvancedCache();

/**
 * Hook-like API for React components
 */
export function createCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return `${endpoint}?${searchParams.toString()}`;
}

/**
 * Fetch with caching utility
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit & CacheOptions = {}
): Promise<T> {
  const { ttl, staleTime, maxAge, retryCount, retryDelay, ...fetchOptions } = options;
  
  const cacheKey = createCacheKey(url, fetchOptions.method === 'POST' ? undefined : {});
  
  return apiCache.fetch(
    cacheKey,
    async () => {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    { ttl, staleTime, maxAge, retryCount, retryDelay }
  );
}

export default apiCache;