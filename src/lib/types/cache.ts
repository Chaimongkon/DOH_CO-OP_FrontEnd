/**
 * Cache-related Type Definitions
 * ประเภทข้อมูลที่เกี่ยวข้องกับระบบแคช
 */

// Cache Entry Interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
  key: string;
  tags?: string[];
  size?: number;
}

// Cache Options
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleTime?: number; // Time before data becomes stale
  maxAge?: number; // Maximum age before forced refresh
  retryCount?: number;
  retryDelay?: number;
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Enable compression
  serialize?: (data: unknown) => string;
  deserialize?: (data: string) => unknown;
}

// Cache Statistics
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number; // Percentage
  totalKeys: number;
  memoryUsage?: number; // In bytes
  lastReset: number;
}

// Cache Configuration
export interface CacheConfig {
  ttl: number;
  maxKeys: number;
  maxMemory: number; // In bytes
  enableCompression: boolean;
  enableMetrics: boolean;
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  persistToDisk?: boolean;
  diskPath?: string;
}

// Redis Configuration
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  family: 4 | 6;
  keyPrefix?: string;
}

// Cache Provider Interface
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  ping(): Promise<string>;
  getStats(): Promise<CacheStats>;
}

// Cache Event Types
export type CacheEventType = 
  | 'hit' 
  | 'miss' 
  | 'set' 
  | 'delete' 
  | 'clear' 
  | 'expire' 
  | 'evict'
  | 'error';

export interface CacheEvent {
  type: CacheEventType;
  key: string;
  timestamp: number;
  data?: unknown;
  error?: Error;
}

// Cache Observer
export type CacheObserver<T> = (data: T) => void;

// Cache Invalidation
export interface InvalidationRule {
  tags?: string[];
  pattern?: string;
  condition?: (key: string, data: unknown) => boolean;
}

// Cache Presets
export interface CachePreset {
  name: string;
  ttl: number;
  staleTime?: number;
  maxAge?: number;
  tags?: string[];
  description: string;
}

// Multi-level Cache Configuration
export interface MultiLevelCacheConfig {
  l1: {
    provider: 'memory';
    config: CacheConfig;
  };
  l2?: {
    provider: 'redis' | 'memcached';
    config: RedisConfig | CacheConfig;
  };
  l3?: {
    provider: 'disk' | 'database';
    config: CacheConfig;
  };
}

// Cache Performance Metrics
export interface CachePerformanceMetrics {
  averageGetTime: number; // milliseconds
  averageSetTime: number; // milliseconds
  throughput: number; // operations per second
  errorRate: number; // percentage
  memoryEfficiency: number; // percentage
  compressionRatio?: number; // if compression is enabled
}

// Cache Health Check
export interface CacheHealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  latency: number; // milliseconds
  memoryUsage: number; // bytes
  connections?: number;
  errors: string[];
  lastCheck: number;
}

// Background Cache Operations
export interface BackgroundCacheOperation {
  type: 'refresh' | 'cleanup' | 'preload' | 'backup';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  progress?: number; // 0-100
  error?: string;
  details?: Record<string, unknown>;
}

// Cache Strategy
export type CacheStrategy = 
  | 'cache-first' 
  | 'network-first' 
  | 'cache-only' 
  | 'network-only' 
  | 'stale-while-revalidate';

export interface CacheStrategyConfig {
  strategy: CacheStrategy;
  fallbackStrategy?: CacheStrategy;
  timeout?: number;
  retries?: number;
}