/**
 * Database Health Check API
 * API สำหรับตรวจสอบสุขภาพฐานข้อมูล
 */

import { NextRequest, NextResponse } from 'next/server';
import { healthMonitor } from '@/lib/db/health-monitor';
import { queryCache } from '@/lib/db/query-cache';
import { withPublicApi, withAuthApi, ApiRequestContext } from '@/lib/api-middleware';
import { isValidAdminToken } from '@/lib/validation';
import logger from '@/lib/logger';

async function handleHealthGet(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        return await getHealthStatus();
      
      case 'metrics':
        return getHealthMetrics(request);
      
      case 'insights':
        return await getHealthInsights();
      
      case 'cache-stats':
        return await getCacheStats();
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Database health API error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getHealthStatus() {
  const health = await healthMonitor.getHealth();
  
  return NextResponse.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString()
  });
}

function getHealthMetrics(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') || '100', 10),
    1000
  );
  
  const metrics = healthMonitor.getMetrics(limit);
  
  return NextResponse.json({
    success: true,
    data: metrics,
    count: metrics.length
  });
}

async function getHealthInsights() {
  const insights = await healthMonitor.getInsights();
  
  return NextResponse.json({
    success: true,
    data: insights
  });
}

async function getCacheStats() {
  const stats = await queryCache.getStats();
  const isAvailable = await queryCache.isAvailable();
  
  return NextResponse.json({
    success: true,
    data: {
      ...stats,
      available: isAvailable
    }
  });
}

// POST endpoint for administrative actions - REQUIRES AUTHENTICATION
async function handleHealthPost(request: NextRequest, context: ApiRequestContext) {
  // Verify admin authentication
  const authHeader = request.headers.get('authorization');
  if (!isValidAdminToken(authHeader)) {
    logger.security('Unauthorized database health admin access attempt', {
      ip: context.ip,
      userAgent: context.userAgent,
      severity: 'high'
    });
    
    return NextResponse.json(
      { success: false, error: 'Admin authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    // Log admin action for audit trail
    logger.info('Database health admin action', {
      action,
      ip: context.ip,
      userAgent: context.userAgent
    });

    switch (action) {
      case 'start-monitoring':
        return startMonitoring(body.interval);
      
      case 'stop-monitoring':
        return stopMonitoring();
      
      case 'clear-cache':
        return await clearCache(body.pattern);
      
      case 'reset-cache-stats':
        return await resetCacheStats();
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Database health admin API error', {
      error: error instanceof Error ? error.message : String(error),
      ip: context.ip,
      userAgent: context.userAgent
    });
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple handler without middleware context for GET operations
export const GET = withPublicApi(async (request: NextRequest) => {
  return handleHealthGet(request);
});
export const POST = withAuthApi(handleHealthPost);

function startMonitoring(interval?: number) {
  const intervalMs = interval && interval >= 5000 ? interval : 30000;
  healthMonitor.start(intervalMs);
  
  return NextResponse.json({
    success: true,
    message: 'Health monitoring started',
    interval: intervalMs
  });
}

function stopMonitoring() {
  healthMonitor.stop();
  
  return NextResponse.json({
    success: true,
    message: 'Health monitoring stopped'
  });
}

async function clearCache(pattern?: string) {
  const cleared = await queryCache.clear(pattern);
  
  return NextResponse.json({
    success: true,
    message: `Cleared ${cleared} cache entries`,
    pattern: pattern || 'all'
  });
}

async function resetCacheStats() {
  const success = await queryCache.resetStats();
  
  return NextResponse.json({
    success,
    message: success ? 'Cache stats reset' : 'Failed to reset cache stats'
  });
}