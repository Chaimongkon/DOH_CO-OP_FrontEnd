/**
 * Database Health Monitoring System
 * ระบบตรวจสอบสุขภาพฐานข้อมูล
 */

import { db, DatabasePool } from './database-pool';
import { queryCache } from './query-cache';
import redis from './redis';
import logger from '@/lib/logger';
import { 
  DatabaseHealth,
  ConnectionHealth,
  CacheHealth,
  OverallHealth,
  HealthMetrics
} from '@/lib/types/database';

export class DatabaseHealthMonitor {
  private metrics: HealthMetrics[] = [];
  private isMonitoring: boolean = false;
  private monitorInterval?: NodeJS.Timeout;
  private alertThresholds = {
    latency: 1000, // ms
    errorRate: 0.05, // 5%
    connectionUsage: 0.8, // 80%
    cacheHitRate: 0.7 // 70%
  };

  /**
   * Start health monitoring
   */
  start(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      logger.warn('Health monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.monitorInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
      } catch (error) {
        logger.error('Health monitoring error', { error });
      }
    }, intervalMs);

    logger.info('Database health monitoring started', { intervalMs });
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
    this.isMonitoring = false;
    logger.info('Database health monitoring stopped');
  }

  /**
   * Get current health status
   */
  async getHealth(): Promise<DatabaseHealth> {
    const timestamp = Date.now();
    
    // Check database health
    const dbHealth = await db.healthCheck();
    
    // Check cache health  
    const cacheHealth = await this.checkCacheHealth();
    
    // Calculate overall health
    const overall = this.calculateOverallHealth(dbHealth, cacheHealth);

    return {
      master: this.mapDbHealth(dbHealth.master),
      replicas: dbHealth.replicas.map(replica => this.mapDbHealth(replica)),
      cache: cacheHealth,
      overall,
      timestamp
    };
  }

  /**
   * Get health metrics history
   */
  getMetrics(limit: number = 100): HealthMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get performance insights
   */
  async getInsights(): Promise<{
    slowQueries: string[];
    recommendations: string[];
    trends: {
      latency: 'improving' | 'stable' | 'degrading';
      errorRate: 'improving' | 'stable' | 'degrading';
      cacheHitRate: 'improving' | 'stable' | 'degrading';
    };
  }> {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length < 2) {
      return {
        slowQueries: [],
        recommendations: ['Insufficient metrics data for analysis'],
        trends: { latency: 'stable', errorRate: 'stable', cacheHitRate: 'stable' }
      };
    }

    const recommendations: string[] = [];
    const trends = {
      latency: this.analyzeTrend(recentMetrics.map(m => m.averageLatency)) as 'improving' | 'stable' | 'degrading',
      errorRate: this.analyzeTrend(recentMetrics.map(m => m.errorCount / Math.max(m.queryCount, 1))) as 'improving' | 'stable' | 'degrading',
      cacheHitRate: this.analyzeTrend(recentMetrics.map(m => m.cacheHitRate)) as 'improving' | 'stable' | 'degrading'
    };

    // Generate recommendations based on trends and current metrics
    const latest = recentMetrics[recentMetrics.length - 1];
    
    if (latest.averageLatency > this.alertThresholds.latency) {
      recommendations.push('High average query latency detected. Consider query optimization or adding indexes.');
    }
    
    if (latest.cacheHitRate < this.alertThresholds.cacheHitRate) {
      recommendations.push('Low cache hit rate. Review caching strategy and TTL settings.');
    }
    
    if (trends.latency === 'degrading') {
      recommendations.push('Query latency is trending upward. Monitor database load and consider scaling.');
    }

    if (trends.cacheHitRate === 'degrading') {
      recommendations.push('Cache hit rate is declining. Check cache invalidation strategy.');
    }

    return {
      slowQueries: [], // Would need query logging to implement
      recommendations,
      trends
    };
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<CacheHealth> {
    try {
      const start = Date.now();
      await redis.ping();
      const latency = Date.now() - start;
      
      // Get cache stats
      const stats = await queryCache.getStats();
      
      // Get Redis info
      const info = await redis.info('memory');
      const memoryInfo = this.parseRedisMemoryInfo(info);

      const status = this.determineCacheStatus(latency, stats.hitRate, memoryInfo);

      return {
        status,
        latency,
        memory: memoryInfo,
        hitRate: stats.hitRate
      };
    } catch (error) {
      return {
        status: 'critical',
        latency: -1,
        error: (error as Error).message
      };
    }
  }

  /**
   * Parse Redis memory information
   */
  private parseRedisMemoryInfo(info: string): CacheHealth['memory'] {
    const lines = info.split('\r\n');
    const memory: Record<string, number> = {};

    lines.forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        if (key.includes('memory')) {
          memory[key] = parseInt(value, 10);
        }
      }
    });

    return {
      used: memory.used_memory || 0,
      peak: memory.used_memory_peak || 0,
      available: memory.maxmemory || 0
    };
  }

  /**
   * Determine cache status based on metrics
   */
  private determineCacheStatus(
    latency: number, 
    hitRate: number, 
    memory: CacheHealth['memory']
  ): CacheHealth['status'] {
    // Check memory usage if available
    const memoryUsagePercent = memory && memory.available > 0 
      ? (memory.used / memory.available) * 100 
      : 0;
    
    // Critical conditions
    if (latency > 100 || hitRate < 50 || memoryUsagePercent > 90) {
      return 'critical';
    }
    
    // Warning conditions
    if (latency > 50 || hitRate < 70 || memoryUsagePercent > 75) {
      return 'warning';
    }
    
    return 'healthy';
  }

  /**
   * Map database health check result
   */
  private mapDbHealth(health: { healthy: boolean; latency?: number; error?: string }): ConnectionHealth {
    if (!health.healthy) {
      return {
        status: 'critical',
        latency: -1,
        error: health.error
      };
    }

    const latency = health.latency || 0;
    let status: ConnectionHealth['status'] = 'healthy';
    
    if (latency > this.alertThresholds.latency) status = 'critical';
    else if (latency > this.alertThresholds.latency / 2) status = 'warning';

    return { status, latency };
  }

  /**
   * Calculate overall health score
   */
  private calculateOverallHealth(
    dbHealth: Awaited<ReturnType<DatabasePool['healthCheck']>>,
    cacheHealth: CacheHealth
  ): OverallHealth {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check master database
    if (!dbHealth.master.healthy) {
      issues.push('Master database is unhealthy');
      score -= 50;
    } else if ((dbHealth.master.latency || 0) > this.alertThresholds.latency) {
      issues.push('High master database latency');
      score -= 20;
    }

    // Check replicas
    const unhealthyReplicas = dbHealth.replicas.filter(r => !r.healthy).length;
    if (unhealthyReplicas > 0) {
      issues.push(`${unhealthyReplicas} replica(s) are unhealthy`);
      score -= unhealthyReplicas * 10;
    }

    // Check cache
    if (cacheHealth.status === 'critical') {
      issues.push('Cache is in critical state');
      score -= 30;
    } else if (cacheHealth.status === 'warning') {
      issues.push('Cache performance is degraded');
      score -= 15;
    }

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push('Monitor system closely and investigate reported issues');
    }
    
    if ((cacheHealth.hitRate || 0) < this.alertThresholds.cacheHitRate * 100) {
      recommendations.push('Optimize caching strategy to improve hit rate');
    }

    const status: OverallHealth['status'] = 
      score >= 80 ? 'healthy' : 
      score >= 60 ? 'warning' : 'critical';

    return { status, score: Math.max(0, score), issues, recommendations };
  }

  /**
   * Collect health metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const health = await this.getHealth();
      const cacheStats = await queryCache.getStats();
      
      const metric: HealthMetrics = {
        timestamp: Date.now(),
        queryCount: 0, // Would need to be tracked separately
        errorCount: 0, // Would need to be tracked separately
        averageLatency: health.master.latency,
        cacheHitRate: cacheStats.hitRate,
        activeConnections: 0 // Would need connection tracking
      };

      this.metrics.push(metric);
      
      // Keep only last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
    } catch (error) {
      logger.error('Failed to collect health metrics', { error });
    }
  }

  /**
   * Check for alerts based on current metrics
   */
  private async checkAlerts(): Promise<void> {
    const health = await this.getHealth();
    
    if (health.overall.status === 'critical') {
      logger.error('Database health is critical', {
        issues: health.overall.issues,
        score: health.overall.score
      });
    } else if (health.overall.status === 'warning') {
      logger.warn('Database health warning', {
        issues: health.overall.issues,
        score: health.overall.score
      });
    }
  }

  /**
   * Analyze trend direction
   */
  private analyzeTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    if (values.length < 3) return 'stable';
    
    const recent = values.slice(-3);
    const trend = recent[2] - recent[0];
    const threshold = recent[0] * 0.1; // 10% change threshold
    
    if (Math.abs(trend) < threshold) return 'stable';
    return trend > 0 ? 'degrading' : 'improving';
  }
}

// Export singleton instance
export const healthMonitor = new DatabaseHealthMonitor();