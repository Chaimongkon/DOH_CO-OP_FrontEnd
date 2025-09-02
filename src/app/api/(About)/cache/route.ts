import { NextResponse, NextRequest } from "next/server";
import { 
  invalidateAboutCaches, 
  getCacheStatus, 
  warmUpCache,
  CACHE_KEYS 
} from "@/lib/cache-manager";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET: Get cache status
export async function GET() {
  try {
    const status = await getCacheStatus();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      caches: status,
      keys: CACHE_KEYS,
    }, { status: 200 });
  } catch (error) {
    logger.error("Error getting cache status", error);
    return NextResponse.json({
      success: false,
      error: "Failed to get cache status",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST: Cache management operations
export async function POST(req: NextRequest) {
  try {
    const { action, baseUrl } = await req.json();
    const timestamp = new Date().toISOString();

    switch (action) {
      case 'invalidate':
        const invalidateResult = await invalidateAboutCaches();
        return NextResponse.json({
          success: invalidateResult.success,
          timestamp,
          action: 'invalidate',
          result: invalidateResult,
        }, { status: invalidateResult.success ? 200 : 500 });

      case 'warmup':
        if (!baseUrl) {
          return NextResponse.json({
            success: false,
            error: "Base URL required for warm-up"
          }, { status: 400 });
        }
        
        const warmupResult = await warmUpCache(baseUrl);
        return NextResponse.json({
          success: warmupResult.success,
          timestamp,
          action: 'warmup',
          result: warmupResult,
        }, { status: warmupResult.success ? 200 : 500 });

      case 'status':
        const status = await getCacheStatus();
        return NextResponse.json({
          success: true,
          timestamp,
          action: 'status',
          result: status,
        }, { status: 200 });

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid action",
          validActions: ['invalidate', 'warmup', 'status']
        }, { status: 400 });
    }
  } catch (error) {
    logger.error("Error in cache management", error);
    return NextResponse.json({
      success: false,
      error: "Cache management operation failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// DELETE: Invalidate all caches
export async function DELETE() {
  try {
    const result = await invalidateAboutCaches();
    
    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      action: 'delete_all',
      result,
    }, { status: result.success ? 200 : 500 });
  } catch (error) {
    logger.error("Error deleting caches", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete caches",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}