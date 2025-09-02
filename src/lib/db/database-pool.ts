/**
 * Database Connection Pool with Read Replicas Support
 * ระบบจัดการการเชื่อมต่อฐานข้อมูลพร้อม read replicas
 */

import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import logger from '@/lib/logger';
import { queryCache } from './query-cache';
import { 
  DatabaseConfig, 
  CustomPoolOptions, 
  QueryOptions, 
  QueryResult 
} from '@/lib/types/database';

export class DatabasePool {
  private masterPool: Pool;
  private replicaPools: Pool[] = [];
  private replicaIndex: number = 0;

  constructor(
    masterConfig: DatabaseConfig,
    replicaConfigs: DatabaseConfig[] = [],
    poolOptions: CustomPoolOptions = {}
  ) {
    // Create master pool
    this.masterPool = mysql.createPool({
      ...masterConfig,
      waitForConnections: true,
      connectionLimit: poolOptions.connectionLimit || 10,
      queueLimit: poolOptions.queueLimit || 0,
      maxIdle: poolOptions.maxIdle || poolOptions.connectionLimit || 10,
      idleTimeout: poolOptions.idleTimeout || 60000,
      typeCast: true,
      supportBigNumbers: true,
      bigNumberStrings: false,
    });

    // Create replica pools
    replicaConfigs.forEach((config, index) => {
      const replicaPool = mysql.createPool({
        ...config,
        waitForConnections: true,
        connectionLimit: Math.max(1, Math.floor((poolOptions.connectionLimit || 10) / 2)),
        queueLimit: poolOptions.queueLimit || 0,
        maxIdle: Math.max(1, Math.floor((poolOptions.maxIdle || poolOptions.connectionLimit || 10) / 2)),
        idleTimeout: poolOptions.idleTimeout || 60000,
        typeCast: true,
        supportBigNumbers: true,
        bigNumberStrings: false,
      });

      this.replicaPools.push(replicaPool);
      logger.info(`Created replica pool ${index + 1}`, { host: config.host, port: config.port });
    });

    logger.info('Database pools initialized', {
      master: `${masterConfig.host}:${masterConfig.port}`,
      replicas: replicaConfigs.length,
      connectionLimit: poolOptions.connectionLimit || 10
    });
  }

  /**
   * Get appropriate pool based on query type
   */
  private getPool(useReplica: boolean = false): Pool {
    if (useReplica && this.replicaPools.length > 0) {
      // Round-robin load balancing
      const pool = this.replicaPools[this.replicaIndex];
      this.replicaIndex = (this.replicaIndex + 1) % this.replicaPools.length;
      return pool;
    }
    return this.masterPool;
  }

  /**
   * Execute a SELECT query (can use replicas)
   */
  async select<T extends RowDataPacket[]>(
    query: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const useReplica = options.useReplica ?? this.isSelectQuery(query);
    const pool = this.getPool(useReplica);

    // Check cache first if caching is enabled
    if (options.cache) {
      const cachedResult = await queryCache.get<QueryResult<T>>(query, params);
      if (cachedResult) {
        return cachedResult;
      }
    }

    try {
      const startTime = Date.now();
      const [rows, fields] = await pool.execute<T>(query, params);
      const duration = Date.now() - startTime;

      const result: QueryResult<T> = {
        data: rows,
        fields
      };

      // Cache the result if caching is enabled
      if (options.cache) {
        await queryCache.set(query, params, result, options.cache);
      }

      logger.debug('Query executed successfully', {
        query: query.substring(0, 100),
        params: params.length,
        duration,
        useReplica,
        rowCount: Array.isArray(rows) ? rows.length : 0
      });

      return result;
    } catch (error) {
      logger.error('Query execution failed', {
        error,
        query: query.substring(0, 100),
        params: params.length,
        useReplica
      });
      throw error;
    }
  }

  /**
   * Execute a write query (INSERT, UPDATE, DELETE) - always uses master
   */
  async execute(
    query: string,
    params: unknown[] = [],
    _options: QueryOptions = {}
  ): Promise<QueryResult<ResultSetHeader>> {
    // Suppress unused parameter warning for future implementation
    void _options;
    
    try {
      const startTime = Date.now();
      const [result, fields] = await this.masterPool.execute<ResultSetHeader>(query, params);
      const duration = Date.now() - startTime;

      // Invalidate cache for write operations
      if (this.isWriteQuery(query)) {
        await this.invalidateRelatedCache(query);
      }

      logger.debug('Write query executed successfully', {
        query: query.substring(0, 100),
        params: params.length,
        duration,
        affectedRows: result.affectedRows,
        insertId: result.insertId
      });

      return {
        data: result,
        fields,
        meta: result
      };
    } catch (error) {
      logger.error('Write query execution failed', {
        error,
        query: query.substring(0, 100),
        params: params.length
      });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.masterPool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      
      logger.debug('Transaction completed successfully');
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error('Transaction failed and rolled back', { error });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get database connection statistics
   */
  async getStats(): Promise<{
    master: { total: number; active: number; idle: number };
    replicas: Array<{ total: number; active: number; idle: number }>;
  }> {
    const masterStats = {
      total: this.masterPool.config.connectionLimit || 0,
      active: 0, // These would need to be tracked separately
      idle: 0
    };

    const replicaStats = this.replicaPools.map(pool => ({
      total: pool.config.connectionLimit || 0,
      active: 0,
      idle: 0
    }));

    return {
      master: masterStats,
      replicas: replicaStats
    };
  }

  /**
   * Health check for all pools
   */
  async healthCheck(): Promise<{
    master: { healthy: boolean; latency?: number; error?: string };
    replicas: Array<{ healthy: boolean; latency?: number; error?: string }>;
  }> {
    const checkPool = async (pool: Pool) => {
      try {
        const start = Date.now();
        await pool.execute('SELECT 1 as health_check');
        const latency = Date.now() - start;
        return { healthy: true, latency };
      } catch (error) {
        return { healthy: false, error: (error as Error).message };
      }
    };

    const [masterHealth, ...replicaHealths] = await Promise.all([
      checkPool(this.masterPool),
      ...this.replicaPools.map(pool => checkPool(pool))
    ]);

    return {
      master: masterHealth,
      replicas: replicaHealths
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await Promise.all([
      this.masterPool.end(),
      ...this.replicaPools.map(pool => pool.end())
    ]);
    logger.info('All database pools closed');
  }

  /**
   * Check if query is a SELECT statement
   */
  private isSelectQuery(query: string): boolean {
    return /^\s*SELECT\b/i.test(query.trim());
  }

  /**
   * Check if query is a write operation
   */
  private isWriteQuery(query: string): boolean {
    return /^\s*(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE)\b/i.test(query.trim());
  }

  /**
   * Invalidate cache entries that might be affected by a write query
   */
  private async invalidateRelatedCache(query: string): Promise<void> {
    try {
      // Extract table names from query
      const tables = this.extractTableNames(query);
      
      // Clear cache entries that might be related to these tables
      for (const table of tables) {
        await queryCache.clear(`*${table}*`);
      }
      
      logger.debug('Cache invalidated for tables', { tables });
    } catch (error) {
      logger.warn('Failed to invalidate cache', { error });
    }
  }

  /**
   * Extract table names from SQL query (basic implementation)
   */
  private extractTableNames(query: string): string[] {
    const tablePatterns = [
      /FROM\s+`?(\w+)`?/gi,
      /INTO\s+`?(\w+)`?/gi,
      /UPDATE\s+`?(\w+)`?/gi,
      /JOIN\s+`?(\w+)`?/gi
    ];

    const tables = new Set<string>();
    
    tablePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        tables.add(match[1].toLowerCase());
      }
    });

    return Array.from(tables);
  }
}

// Create singleton instance with environment configuration
export const createDatabasePool = () => {
  const masterConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_SCHEMA || 'test',
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    } : undefined,
  };

  // Parse replica configurations from environment
  const replicaConfigs: DatabaseConfig[] = [];
  let replicaIndex = 1;
  
  while (process.env[`DB_REPLICA_${replicaIndex}_HOST`]) {
    replicaConfigs.push({
      host: process.env[`DB_REPLICA_${replicaIndex}_HOST`]!,
      port: parseInt(process.env[`DB_REPLICA_${replicaIndex}_PORT`] || '3306', 10),
      user: process.env[`DB_REPLICA_${replicaIndex}_USER`] || masterConfig.user,
      password: process.env[`DB_REPLICA_${replicaIndex}_PASS`] || masterConfig.password,
      database: process.env[`DB_REPLICA_${replicaIndex}_SCHEMA`] || masterConfig.database,
      ssl: masterConfig.ssl
    });
    replicaIndex++;
  }

  const poolOptions: CustomPoolOptions = {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
    maxIdle: parseInt(process.env.DB_MAX_IDLE || process.env.DB_CONNECTION_LIMIT || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),
  };

  return new DatabasePool(masterConfig, replicaConfigs, poolOptions);
};

// Export singleton instance
export const db = createDatabasePool();