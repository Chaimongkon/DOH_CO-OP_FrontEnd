/**
 * Database Query Helper with Caching and Optimization
 * ตัวช่วยสำหรับ query ฐานข้อมูลพร้อมระบบแคชและการปรับปรุงประสิทธิภาพ
 */

import { db } from './database-pool';
import { CACHE_PRESETS } from './query-cache';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import logger from '@/lib/logger';
import { 
  QueryHelperOptions,
  PaginationOptions,
  CountResult,
  PaginatedResult,
  BatchInsertOptions,
  BatchInsertResult,
  CacheOptions
} from '@/lib/types/database';

export class QueryHelper {
  private defaultOptions: QueryHelperOptions = {
    useReplica: true,
    logSlowQueries: true,
    slowQueryThreshold: 1000, // 1 second
    retries: 1
  };

  /**
   * Execute a SELECT query with caching and optimization
   */
  async select<T extends RowDataPacket[]>(
    query: string,
    params: unknown[] = [],
    options: QueryHelperOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      // Prepare cache options
      const cacheOptions = this.prepareCacheOptions(opts.cache);
      
      // Execute query with retries
      let lastError: Error | null = null;
      const maxRetries = opts.retries || 1;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await db.select<T>(query, params, {
            useReplica: opts.useReplica,
            cache: cacheOptions,
            timeout: opts.timeout
          });

          // Log slow queries
          const duration = Date.now() - startTime;
          if (opts.logSlowQueries && duration > (opts.slowQueryThreshold || 1000)) {
            logger.warn('Slow query detected', {
              query: query.substring(0, 200),
              params: params.length,
              duration,
              attempt
            });
          }

          return result.data;
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            await this.delay(attempt * 100); // Exponential backoff
          }
        }
      }

      throw lastError;
    } catch (error) {
      logger.error('Query execution failed', {
        error,
        query: query.substring(0, 200),
        params: params.length
      });
      throw error;
    }
  }

  /**
   * Execute a single SELECT query and return first row
   */
  async selectOne<T extends RowDataPacket>(
    query: string,
    params: unknown[] = [],
    options: QueryHelperOptions = {}
  ): Promise<T | null> {
    const results = await this.select<T[]>(query, params, options);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute a paginated SELECT query
   */
  async selectPaginated<T extends RowDataPacket>(
    baseQuery: string,
    params: unknown[] = [],
    pagination: PaginationOptions,
    options: QueryHelperOptions = {}
  ): Promise<PaginatedResult<T>> {
    const { page, limit, orderBy, orderDirection = 'ASC' } = pagination;
    const offset = (page - 1) * limit;

    // Build the complete query with ORDER BY and LIMIT
    let query = baseQuery;
    if (orderBy) {
      query += ` ORDER BY ${orderBy} ${orderDirection}`;
    }
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;
    const [data, countResult] = await Promise.all([
      this.select<T[]>(query, params, options),
      this.selectOne<CountResult>(countQuery, params, options)
    ]);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   */
  async execute(
    query: string,
    params: unknown[] = [],
    options: Omit<QueryHelperOptions, 'useReplica' | 'cache'> = {}
  ): Promise<ResultSetHeader> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      let lastError: Error | null = null;
      const maxRetries = opts.retries || 1;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await db.execute(query, params, {
            timeout: opts.timeout
          });

          // Log slow queries
          const duration = Date.now() - startTime;
          if (opts.logSlowQueries && duration > (opts.slowQueryThreshold || 1000)) {
            logger.warn('Slow write query detected', {
              query: query.substring(0, 200),
              params: params.length,
              duration,
              attempt
            });
          }

          return result.data;
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            await this.delay(attempt * 100);
          }
        }
      }

      throw lastError;
    } catch (error) {
      logger.error('Write query execution failed', {
        error,
        query: query.substring(0, 200),
        params: params.length
      });
      throw error;
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  async transaction<T>(
    callback: (helper: TransactionHelper) => Promise<T>
  ): Promise<T> {
    return await db.transaction(async (connection) => {
      const transactionHelper = new TransactionHelper(connection);
      return await callback(transactionHelper);
    });
  }

  /**
   * Batch insert operation
   */
  async batchInsert<T extends Record<string, unknown>>(
    tableName: string,
    records: T[],
    options: BatchInsertOptions = {}
  ): Promise<BatchInsertResult> {
    if (records.length === 0) {
      return { insertedRows: 0, affectedRows: 0 };
    }

    const { batchSize = 100, onDuplicateKeyUpdate = false, insertIgnore = false } = options;
    const keys = Object.keys(records[0]);
    let totalInserted = 0;
    let totalAffected = 0;

    // Process records in batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Build INSERT query
      let query = insertIgnore ? 'INSERT IGNORE INTO' : 'INSERT INTO';
      query += ` ${tableName} (${keys.map(k => `\`${k}\``).join(', ')})`;
      query += ' VALUES ';
      
      const valuePlaceholders = batch.map(() => 
        `(${keys.map(() => '?').join(', ')})`
      ).join(', ');
      
      query += valuePlaceholders;

      // Add ON DUPLICATE KEY UPDATE if specified
      if (onDuplicateKeyUpdate) {
        const updateClause = keys
          .filter(key => key !== 'id') // Assuming 'id' is the primary key
          .map(key => `\`${key}\` = VALUES(\`${key}\`)`)
          .join(', ');
        query += ` ON DUPLICATE KEY UPDATE ${updateClause}`;
      }

      // Flatten parameters
      const params: unknown[] = [];
      batch.forEach(record => {
        keys.forEach(key => {
          params.push(record[key]);
        });
      });

      // Execute batch
      const result = await this.execute(query, params);
      totalInserted += batch.length;
      totalAffected += result.affectedRows;
    }

    logger.info('Batch insert completed', {
      table: tableName,
      totalRecords: records.length,
      batchSize,
      totalInserted,
      totalAffected
    });

    return { insertedRows: totalInserted, affectedRows: totalAffected };
  }

  /**
   * Prepare cache options from various formats
   */
  private prepareCacheOptions(cacheOption?: CacheOptions | keyof typeof CACHE_PRESETS | string): CacheOptions | undefined {
    if (!cacheOption) return undefined;
    
    if (typeof cacheOption === 'string') {
      return CACHE_PRESETS[cacheOption as keyof typeof CACHE_PRESETS] || undefined;
    }
    
    return cacheOption;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Transaction-specific helper
 */
class TransactionHelper {
  constructor(private connection: PoolConnection) {}

  async select<T extends RowDataPacket[]>(
    query: string,
    params: unknown[] = []
  ): Promise<T> {
    const [rows] = await this.connection.execute<T>(query, params);
    return rows;
  }

  async selectOne<T extends RowDataPacket>(
    query: string,
    params: unknown[] = []
  ): Promise<T | null> {
    const results = await this.select<T[]>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(
    query: string,
    params: unknown[] = []
  ): Promise<ResultSetHeader> {
    const [result] = await this.connection.execute<ResultSetHeader>(query, params);
    return result;
  }
}

// Export singleton instance
export const queryHelper = new QueryHelper();

// Export helper functions for common patterns
export const queries = {
  /**
   * Get records with caching
   */
  getCached: <T extends RowDataPacket[]>(
    query: string,
    params: unknown[] = [],
    cachePreset: keyof typeof CACHE_PRESETS = 'MEDIUM'
  ) => queryHelper.select<T>(query, params, { cache: cachePreset }),

  /**
   * Get paginated results
   */
  getPaginated: <T extends RowDataPacket>(
    query: string,
    params: unknown[],
    pagination: PaginationOptions,
    cachePreset: keyof typeof CACHE_PRESETS = 'SHORT'
  ) => queryHelper.selectPaginated<T>(query, params, pagination, { cache: cachePreset }),

  /**
   * Get single record with caching
   */
  getOneCached: <T extends RowDataPacket>(
    query: string,
    params: unknown[] = [],
    cachePreset: keyof typeof CACHE_PRESETS = 'MEDIUM'
  ) => queryHelper.selectOne<T>(query, params, { cache: cachePreset }),

  /**
   * Execute write operation with retry
   */
  write: (query: string, params: unknown[] = []) => 
    queryHelper.execute(query, params, { retries: 2 })
};