import pool from "@/lib/db/mysql";
import redis from "@/lib/db/redis";
import { FieldPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";
import { OrganizationalRow } from "@/types/database";
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
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Types are now imported from centralized database types

async function organizationalHandler(request: NextRequest, context: ApiRequestContext) {
  let db;
  const cacheKey = "organizational:all";
  const cacheExpiry = 3600; // 1 hour

  // Check Redis cache first
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info("Organizational data served from cache", { requestId: context.requestId });
      const parsedData = JSON.parse(cachedData);
      return createSuccessResponse(
        parsedData,
        "Organizational data retrieved from cache",
        getCacheHeaders('HIT', 3600, 'organizational')
      );
    }
  } catch (cacheError) {
    logger.warn("Redis cache read failed", { 
      error: cacheError,
      requestId: context.requestId 
    });
    // Continue to database if cache fails
  }

  try {
    // Database connection with timeout
    db = await pool.getConnection();
    
    if (!db) {
      throw new DatabaseError("Failed to establish database connection");
    }

    const query = `SELECT Id, Name, Position, Priority, Type, ImagePath FROM treeorganizational ORDER BY Id ASC`;

    // Execute query with error handling
    const [rows]: [OrganizationalRow[], FieldPacket[]] = await db.query(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      throw new ApiError(
        "Database returned unexpected data format",
        undefined,
        500
      );
    }

    // Process and validate each row
    const processedRows = rows.map((row: OrganizationalRow) => {
      // Validate required fields
      if (!row.Id || !row.Name || !row.Position || !row.Type) {
        logger.warn(`Incomplete organizational data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        ...row,
        ImagePath: row.ImagePath
          ? `/Organizational/File/${path.basename(row.ImagePath)}`
          : null,
      };
    });

    logger.info(`Successfully fetched ${processedRows.length} organizational records`, {
      requestId: context.requestId,
      count: processedRows.length
    });
    
    // Cache the processed data in Redis
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("Organizational data cached successfully", { requestId: context.requestId });
    } catch (cacheError) {
      logger.warn("Failed to cache organizational data", { 
        error: cacheError,
        requestId: context.requestId 
      });
      // Don't fail the request if caching fails
    }
    
    return createSuccessResponse(
      processedRows,
      `Successfully fetched ${processedRows.length} organizational records`,
      getCacheHeaders('MISS', 3600, 'organizational')
    );

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && (error.message.includes('ER_') || error.message.includes('SQL'))) {
      throw new DatabaseError("Database query failed", error, {
        requestId: context.requestId,
        query: "treeorganizational"
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in organizational API",
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
export const GET = withPublicApi(organizationalHandler);