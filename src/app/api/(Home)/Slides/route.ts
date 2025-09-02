import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import redis from "@/lib/db/redis";
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";
import { createSuccessResponse, getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { DatabaseError, ApiError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface SlideRow extends RowDataPacket {
  Id: number;
  No: number;
  ImagePath: string;
  URLLink: string;
}

interface ProcessedSlide {
  Id: number;
  No: number;
  ImagePath: string | null;
  URLLink: string;
}

async function slidesHandler(
  _request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;

  try {
    const cacheKey = 'slides:all';
    
    try {
      // Try to get from cache first (30 minute cache for slides)
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Slides data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult) as ProcessedSlide[];
        return createSuccessResponse(data, 'Slides retrieved successfully', 
          getCacheHeaders('HIT', 1800, 'slides')
        );
      }
    } catch (redisError) {
      logger.warn('Redis cache error, proceeding without cache', {
        error: redisError instanceof Error ? redisError.message : String(redisError),
        requestId: context.requestId
      });
    }

    // Get database connection
    try {
      db = await pool.getConnection();
    } catch (error) {
      throw new DatabaseError(
        "Failed to connect to database",
        error instanceof Error ? error : new Error(String(error))
      );
    }

    try {
      const query = `SELECT Id, No, ImagePath, URLLink FROM slides ORDER BY No ASC`;
      const [rows]: [SlideRow[], FieldPacket[]] = await db.query(query);

      // Process the rows to format image paths
      // Support both local files and external URLs
      const processedRows: ProcessedSlide[] = rows.map((row: SlideRow) => ({
        ...row,
        ImagePath: row.ImagePath ? (() => {
          const imagePath = row.ImagePath.trim();
          
          // Check if it's already a full URL (external)
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath; // Return external URL as-is
          }
          
          // Check if it's already a processed local path
          if (imagePath.startsWith('/Slides/File/')) {
            return imagePath; // Return as-is if already processed
          }
          
          // Process as local file path
          return `/Slides/File/${path.basename(imagePath)}`;
        })() : null,
      }));

      // Cache the result for 30 minutes
      try {
        await redis.setex(cacheKey, 1800, JSON.stringify(processedRows));
      } catch (redisError) {
        logger.warn('Failed to cache slides data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      logger.info('Slides data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        resultCount: rows.length,
        cacheHit: false
      });

      return createSuccessResponse(
        processedRows,
        'Slides retrieved successfully',
        getCacheHeaders('MISS', 1800, 'slides')
      );
      
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
          throw new DatabaseError("Database connection timeout", error);
        }
        throw new DatabaseError("Database query failed", error);
      }
      throw new ApiError("Database operation failed", ApiErrorCodes.DB_ERROR, 500);
    }
    
  } catch (error) {
    logger.error('Error in slides handler', {
      error: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      ip: context.ip,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error; // Re-throw to be handled by middleware
  } finally {
    // Ensure database connection is released
    if (db) {
      try {
        db.release();
      } catch (error) {
        logger.warn('Error releasing database connection', {
          error: error instanceof Error ? error.message : String(error),
          requestId: context.requestId
        });
      }
    }
  }
}

export const GET = withPublicApi(slidesHandler);

