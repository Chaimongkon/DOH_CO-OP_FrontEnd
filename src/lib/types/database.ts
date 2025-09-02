/**
 * Database-related Type Definitions
 * ประเภทข้อมูลที่เกี่ยวข้องกับฐานข้อมูล
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import mysql from 'mysql2/promise';

// Database Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: mysql.SslOptions;
}

export interface CustomPoolOptions {
  connectionLimit?: number;
  queueLimit?: number;
  maxIdle?: number;
  idleTimeout?: number;
}

// Query Result Types
export interface QueryResult<T = RowDataPacket[]> {
  data: T;
  fields?: mysql.FieldPacket[];
  meta?: ResultSetHeader;
}

export interface CountResult extends RowDataPacket {
  total: number;
}

// Query Options
export interface QueryOptions {
  cache?: CacheOptions;
  useReplica?: boolean;
  timeout?: number;
}

export interface QueryHelperOptions {
  useReplica?: boolean;
  cache?: CacheOptions | keyof typeof CACHE_PRESETS;
  timeout?: number;
  retries?: number;
  logSlowQueries?: boolean;
  slowQueryThreshold?: number;
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Cache Types (imported from cache module)
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  preset?: string;
}

// Health Monitoring Types
export interface ConnectionHealth {
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  connections?: {
    total: number;
    active: number;
    idle: number;
  };
  error?: string;
  uptime?: number;
}

export interface CacheHealth {
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  memory?: {
    used: number;
    peak: number;
    available: number;
  };
  hitRate?: number;
  error?: string;
}

export interface OverallHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

export interface DatabaseHealth {
  master: ConnectionHealth;
  replicas: ConnectionHealth[];
  cache: CacheHealth;
  overall: OverallHealth;
  timestamp: number;
}

export interface HealthMetrics {
  timestamp: number;
  queryCount: number;
  errorCount: number;
  averageLatency: number;
  cacheHitRate: number;
  activeConnections: number;
}

// Batch Operations
export interface BatchInsertOptions {
  batchSize?: number;
  onDuplicateKeyUpdate?: boolean;
  insertIgnore?: boolean;
}

export interface BatchInsertResult {
  insertedRows: number;
  affectedRows: number;
}

// Cache Presets placeholder (will be imported from cache module)
export declare const CACHE_PRESETS: Record<string, CacheOptions>;