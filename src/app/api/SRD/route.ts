import { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import redis from "@/lib/db/redis";
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

export const dynamic = "force-dynamic";

// Define the types for the query results
interface FormDownloadRow extends RowDataPacket {
  Id: number;
  Title: string;
  TypeForm: string;
  TypeMember: string;
  FilePath: string | null;
}

async function srdHandler(request: NextRequest, context: ApiRequestContext) {
  let db;
  const cacheKey = "srd:all";
  const cacheExpiry = 3600; // 1 hour

  // Check Redis cache first
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      logger.info("SRD data served from cache", { requestId: context.requestId });
      const parsedData = JSON.parse(cachedData);
      return createSuccessResponse(
        parsedData,
        "SRD data retrieved from cache",
        getCacheHeaders('HIT', 3600, 'srd')
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

    const query = `SELECT Id, Title, TypeForm, TypeMember, FilePath FROM statuteregularitydeclare ORDER BY TypeForm ASC`;

    const [rows]: [FormDownloadRow[], FieldPacket[]] = await db.query(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      throw new ApiError(
        "Database returned unexpected data format",
        undefined,
        500
      );
    }

    // Process and validate each row
    const processedRows = rows.map((row: FormDownloadRow) => {
      // Validate required fields
      if (!row.Id || !row.Title) {
        logger.warn(`Incomplete SRD data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        ...row,
        FilePath: row.FilePath
          ? `/SRD/File/${path.basename(row.FilePath)}`
          : null,
      };
    });

    logger.info(`Successfully fetched ${processedRows.length} SRD records`, {
      requestId: context.requestId,
      count: processedRows.length
    });
    
    // Cache the processed data in Redis
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("SRD data cached successfully", { requestId: context.requestId });
    } catch (cacheError) {
      logger.warn("Failed to cache SRD data", { 
        error: cacheError,
        requestId: context.requestId 
      });
    }
    
    // Return in original format for backward compatibility
    return createSuccessResponse(
      processedRows,
      `Successfully fetched ${processedRows.length} SRD records`,
      getCacheHeaders('MISS', 3600, 'srd')
    );

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && ((error.message.includes('ER_') || error.message.includes('SQL')))) {
      throw new DatabaseError("Database query failed", error, {
        requestId: context.requestId,
        query: "statuteregularitydeclare"
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in SRD API",
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
export const GET = withPublicApi(srdHandler);
