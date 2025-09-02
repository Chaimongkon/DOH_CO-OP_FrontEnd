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

interface VideoRow extends RowDataPacket {
  Id: number;
  Title: string; 
  YouTubeUrl: string;  
  Details: string;
}

async function electionVideosHandler(request: NextRequest, context: ApiRequestContext) {
  let db;
  const cacheKey = "election-videos:list";
  const cacheExpiry = 600; // 10 minutes

  try {
    // Check Redis cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.info("ElectionVideos data served from cache", { requestId: context.requestId });
        const parsedData = JSON.parse(cachedData);
        return createSuccessResponse(
          parsedData,
          "ElectionVideos data retrieved from cache",
          getCacheHeaders('HIT', 600, 'election-videos')
        );
      }
    } catch (cacheError) {
      logger.warn("Redis cache read failed", { 
        error: cacheError,
        requestId: context.requestId 
      });
    }

    // Database connection with timeout
    db = await pool.getConnection();
    
    if (!db) {
      throw new DatabaseError("Failed to establish database connection");
    }

    const query = "SELECT Id, Title, YouTubeUrl, Details FROM electionvideos ORDER BY Id ASC";
    const [rows]: [VideoRow[], FieldPacket[]] = await db.execute(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      throw new ApiError(
        "Database returned unexpected data format",
        undefined,
        500
      );
    }

    // Process and validate each row
    const processedRows = rows.map((row: VideoRow) => {
      // Validate required fields
      if (!row.Id || !row.Title) {
        logger.warn(`Incomplete election video data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        ...row,
        // Ensure YouTubeUrl is properly formatted if present
        YouTubeUrl: row.YouTubeUrl || null,
      };
    });

    logger.info(`Successfully fetched ${processedRows.length} election video records`, {
      requestId: context.requestId,
      count: processedRows.length
    });

    // Cache the processed data
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("ElectionVideos data cached successfully", { requestId: context.requestId });
    } catch (cacheError) {
      logger.warn("Failed to cache election videos data", { 
        error: cacheError,
        requestId: context.requestId 
      });
    }

    // Return data in standardized format
    return createSuccessResponse(
      processedRows,
      `Successfully fetched ${processedRows.length} election video records`,
      getCacheHeaders('MISS', 600, 'election-videos')
    );

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && (error.message.includes('ER_') || error.message.includes('SQL'))) {
      throw new DatabaseError("Database query failed", error, {
        requestId: context.requestId,
        query: "electionvideos"
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in election videos API",
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
export const GET = withPublicApi(electionVideosHandler);