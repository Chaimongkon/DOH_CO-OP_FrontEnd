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
  ApiError,
  ValidationError 
} from "@/lib/api-errors";
import redis from "@/lib/db/redis";

export const dynamic = "force-dynamic";

interface PhotoRow extends RowDataPacket {
  Id: number;
  Title: string;
  Image: string;
  CreateDate: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

async function photosHandler(request: NextRequest, context: ApiRequestContext) {
  let db;
  const cacheKey = "photos:list";
  const cacheExpiry = 1800; // 30 minutes

  try {
    // Parse and validate query parameters
    const all = request.nextUrl.searchParams.get('all') === 'true';
    const pageParam = request.nextUrl.searchParams.get('page');
    const perPageParam = request.nextUrl.searchParams.get('per_page');
    const search = request.nextUrl.searchParams.get('search');

    // Validate pagination parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const per_page = perPageParam ? parseInt(perPageParam, 10) : 10;

    if (page < 1 || per_page < 1 || per_page > 100) {
      throw new ValidationError(
        "Invalid pagination parameters",
        "pagination",
        { page, per_page }
      );
    }

    // Search validation
    if (search && search.length > 100) {
      throw new ValidationError(
        "Search term too long",
        "search",
        { searchLength: search.length }
      );
    }

    // Check cache for non-search requests
    if (!search && all) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          logger.info("Photos data served from cache", { requestId: context.requestId });
          const parsedData = JSON.parse(cachedData);
          return createSuccessResponse(
            parsedData,
            "Photos data retrieved from cache",
            getCacheHeaders('HIT', 1800, 'photos')
          );
        }
      } catch (cacheError) {
        logger.warn("Redis cache read failed", { 
          error: cacheError,
          requestId: context.requestId 
        });
      }
    }

    // Database connection with timeout
    db = await pool.getConnection();
    
    if (!db) {
      throw new DatabaseError("Failed to establish database connection");
    }

    const params: (string | number)[] = [];
    let query = `SELECT Id, Title, Image, CreateDate FROM photoalbum`;

    // Add search filter if present
    if (search) {
      query += " WHERE Title LIKE ?";
      params.push(`%${search}%`);
    }

    query += ` ORDER BY Id DESC`;

    // Add pagination if not requesting all
    if (!all) {
      const start_idx = (page - 1) * per_page;
      query = `SELECT SQL_CALC_FOUND_ROWS Id, Title, Image, CreateDate FROM photoalbum` + 
              (search ? " WHERE Title LIKE ?" : "") + 
              ` ORDER BY Id DESC LIMIT ${start_idx}, ${per_page}`;
    }

    // Execute query with error handling
    const [rows]: [PhotoRow[], FieldPacket[]] = await db.execute(query, params);

    // Validate query results
    if (!Array.isArray(rows)) {
      throw new ApiError(
        "Database returned unexpected data format",
        undefined,
        500
      );
    }

    // Get total count for pagination (only if not all)
    let total = rows.length;
    let pageCount = 1;
    
    if (!all) {
      const [counts]: [CountRow[], FieldPacket[]] = await db.query("SELECT FOUND_ROWS() AS total");
      total = counts[0].total;
      pageCount = Math.ceil(total / per_page);
    }

    // Process and validate each row
    const processedRows = rows.map((row: PhotoRow) => {
      // Validate required fields
      if (!row.Id || !row.Title) {
        logger.warn(`Incomplete photo data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        ...row,
        // Don't process Image here, leave it for individual photo fetch
      };
    });

    logger.info(`Successfully fetched ${processedRows.length} photo records`, {
      requestId: context.requestId,
      count: processedRows.length,
      search: search ? "with search" : "without search",
      all: all
    });

    // Cache the processed data (only for 'all' requests without search)
    if (all && !search) {
      try {
        await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
        logger.info("Photos data cached successfully", { requestId: context.requestId });
      } catch (cacheError) {
        logger.warn("Failed to cache photos data", { 
          error: cacheError,
          requestId: context.requestId 
        });
      }
    }

    // Return appropriate response format
    if (all) {
      // Legacy PhotoAll format - simple array for backward compatibility
      return createSuccessResponse(
        processedRows,
        `Successfully fetched ${processedRows.length} photo records`,
        getCacheHeaders('MISS', 1800, 'photos')
      );
    } else {
      // Pagination format
      const responseData = {
        page,
        per_page,
        total,
        pageCount,
        data: processedRows,
      };
      return createSuccessResponse(
        responseData,
        `Successfully fetched page ${page} of photo records`,
        getCacheHeaders('MISS', 1800, 'photos')
      );
    }

  } catch (error) {
    // Convert database errors to ApiError
    if (error instanceof Error && ((error.message.includes('ER_') || error.message.includes('SQL')))) {
      throw new DatabaseError("Database query failed", error, {
        requestId: context.requestId,
        query: "photoalbum"
      });
    }
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in photos API",
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
export const GET = withPublicApi(photosHandler);