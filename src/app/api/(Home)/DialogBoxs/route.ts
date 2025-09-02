import { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";
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

export const dynamic = "force-dynamic";

// Define the types for the query results
interface DialogRow extends RowDataPacket {
  Id: number;
  ImagePath: string;
  URLLink: string;
  IsActive: boolean;
}

async function dialogBoxsHandler(request: NextRequest, context: ApiRequestContext) {
  let db;
  const cacheKey = "dialogboxs:active";
  const cacheExpiry = 300; // 5 minutes

  try {
    // Check Redis cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.info("DialogBoxs data served from cache", { requestId: context.requestId });
        const parsedData = JSON.parse(cachedData);
        return createSuccessResponse(
          parsedData,
          "DialogBoxs data retrieved from cache",
          getCacheHeaders('HIT', 300, 'dialogboxs')
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

    const query = `SELECT Id, ImagePath, URLLink, IsActive FROM notification ORDER BY Id ASC`;
    const [rows]: [DialogRow[], FieldPacket[]] = await db.execute(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      throw new ApiError(
        "Database returned unexpected data format",
        undefined,
        500
      );
    }

    // Process and validate each row
    const processedRows = rows.map((row: DialogRow) => {
      // Validate required fields
      if (!row.Id) {
        logger.warn(`Incomplete DialogBoxs data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        ...row,
        ImagePath: row.ImagePath
          ? `/Dialog/File/${path.basename(row.ImagePath)}`
          : null,
      };
    });

    logger.info(`Successfully fetched ${processedRows.length} DialogBoxs records`, {
      requestId: context.requestId,
      count: processedRows.length
    });

    // Cache the processed data
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("DialogBoxs data cached successfully", { requestId: context.requestId });
    } catch (cacheError) {
      logger.warn("Failed to cache DialogBoxs data", { 
        error: cacheError,
        requestId: context.requestId 
      });
    }

    // Return data in standardized format
    return createSuccessResponse(
      processedRows,
      `Successfully fetched ${processedRows.length} DialogBoxs records`,
      getCacheHeaders('MISS', 300, 'dialogboxs')
    );

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && (error.message.includes('ER_') || error.message.includes('SQL'))) {
      throw new DatabaseError("Database query failed", error, {
        requestId: context.requestId,
        query: "notification"
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in DialogBoxs API",
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
export const GET = withPublicApi(dialogBoxsHandler);
