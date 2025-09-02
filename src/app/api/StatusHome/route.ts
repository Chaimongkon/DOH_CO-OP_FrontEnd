import { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";
import { 
  createSuccessResponse, 
  getCacheHeaders 
} from "@/lib/api-helpers";
import { 
  withPublicApi, 
  ApiRequestContext 
} from "@/lib/api-middleware";
import { 
  DatabaseError, 
  ApiError 
} from "@/lib/api-errors";
import redis from "@/lib/db/redis";

export const dynamic = 'force-dynamic';

interface StatusHomeRow extends RowDataPacket {
  Id: number;
  Status: number;
}

async function statusHomeHandler(request: NextRequest, context: ApiRequestContext) {
  let db;
  const cacheKey = "statushome:all";
  const cacheExpiry = 300; // 5 minutes

  // Check Redis cache first
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info("StatusHome data served from cache", { requestId: context.requestId });
      const parsedData = JSON.parse(cachedData);
      return createSuccessResponse(
        { data: parsedData },
        "StatusHome data retrieved from cache",
        getCacheHeaders('HIT', 300, 'statushome')
      );
    }
  } catch (cacheError) {
    logger.warn("Redis cache read failed", { 
      error: cacheError,
      requestId: context.requestId 
    });
  }

  try {
    // Database connection with timeout
    db = await pool.getConnection();
    
    if (!db) {
      throw new DatabaseError("Failed to establish database connection");
    }

    const query = "SELECT Id, Status FROM statushome";
    const [rows]: [StatusHomeRow[], FieldPacket[]] = await db.execute(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      throw new ApiError(
        "Database returned unexpected data format",
        undefined,
        500
      );
    }

    // Process and validate each row
    const processedRows = rows.map((row: StatusHomeRow) => {
      // Validate required fields
      if (typeof row.Id === 'undefined' || typeof row.Status === 'undefined') {
        logger.warn(`Incomplete StatusHome data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        Id: parseInt(String(row.Id)) || 0,
        Status: parseInt(String(row.Status)) || 0
      };
    });

    logger.info(`Successfully fetched ${processedRows.length} StatusHome records`, {
      requestId: context.requestId,
      count: processedRows.length
    });

    // Cache the processed data
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("StatusHome data cached successfully", { requestId: context.requestId });
    } catch (cacheError) {
      logger.warn("Failed to cache StatusHome data", { 
        error: cacheError,
        requestId: context.requestId 
      });
    }

    // Return data in original format for backward compatibility
    return createSuccessResponse(
      { data: processedRows },
      `Successfully fetched ${processedRows.length} StatusHome records`,
      getCacheHeaders('MISS', 300, 'statushome')
    );

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && ((error.message.includes('ER_') || error.message.includes('SQL')))) {
      throw new DatabaseError("Database query failed", error, {
        requestId: context.requestId,
        query: "statushome"
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in StatusHome API",
      undefined,
      500,
      undefined,
      true,
      { requestId: context.requestId }
    );
  } finally {
    if (db) {
      try {
        db.release();
      } catch (releaseError) {
        logger.error("Error releasing database connection", releaseError);
      }
    }
  }
}

// Export the wrapped handler
export const GET = withPublicApi(statusHomeHandler);
