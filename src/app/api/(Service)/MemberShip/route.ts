import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";
import { createSuccessResponse, getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { DatabaseError, ApiError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";
import redis from "@/lib/db/redis";

export const dynamic = 'force-dynamic';

interface ServiceRow extends RowDataPacket {
  Id: number;
  Image: Buffer | null;
  Subcategories: string;
}

interface ProcessedService {
  Id: number;
  Image: string | null;
  Subcategories: string;
}

async function membershipHandler(
  request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    const cacheKey = 'membership:services';
    
    try {
      // Try to get from cache first (15 minute cache for services)
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Membership services data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult) as ProcessedService[];
        return createSuccessResponse(data, 'Membership services retrieved successfully', 
          getCacheHeaders('HIT', 900, 'membership')
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
      const query = "SELECT Id, Image, Subcategories FROM services ORDER BY Id ASC";
      const [rows]: [ServiceRow[], FieldPacket[]] = await db.execute(query);

      // Process the rows to convert the Image field to base64 string
      const processedRows: ProcessedService[] = rows.map((row) => {
        let imageBase64: string | null = null;
        
        if (row.Image && Buffer.isBuffer(row.Image)) {
          try {
            imageBase64 = row.Image.toString('base64');
          } catch (error) {
            logger.warn('Failed to convert image to base64', {
              serviceId: row.Id,
              requestId: context.requestId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
        
        return {
          ...row,
          Image: imageBase64,
        };
      });

      // Cache the result for 15 minutes
      try {
        await redis.setex(cacheKey, 900, JSON.stringify(processedRows));
      } catch (redisError) {
        logger.warn('Failed to cache membership services data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      logger.info('Membership services data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        resultCount: rows.length,
        hasImages: rows.filter(row => row.Image).length,
        cacheHit: false
      });

      return createSuccessResponse(
        processedRows,
        'Membership services retrieved successfully',
        getCacheHeaders('MISS', 900, 'membership')
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
    logger.error('Error in membership handler', {
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

export const GET = withPublicApi(membershipHandler);
