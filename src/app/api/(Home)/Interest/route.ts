import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";
import { createSuccessResponse, getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { DatabaseError, ApiError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";
import redis from "@/lib/db/redis";

export const dynamic = 'force-dynamic';

interface InterestRow extends RowDataPacket {
  Id: number;
  InterestType: string;
  Name: string;
  InterestDate: string;
  Conditions: string;
  InterestRate: string | number;
  InteresrRateDual: string | number; // Note: keeping original column name (typo)
}

async function interestHandler(
  request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    const cacheKey = 'interest:all';
    
    try {
      // Try to get from cache first (5 minute cache for interest rates)
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Interest data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult) as InterestRow[];
        return createSuccessResponse(data, 'Interest rates retrieved successfully', 
          getCacheHeaders('HIT', 300, 'interest')
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
      const query = "SELECT Id, InterestType, Name, InterestDate, Conditions, InterestRate, InteresrRateDual FROM interest ORDER BY Id ASC";
      const [rows]: [InterestRow[], FieldPacket[]] = await db.execute(query);

      // Process the rows to ensure proper data types and handle null values
      const processedRows: InterestRow[] = rows.map((row) => ({
        ...row,
        // Keep as string but handle null/undefined values
        InterestRate: row.InterestRate || '',
        InteresrRateDual: row.InteresrRateDual || ''
      }));

      // Cache the result for 5 minutes (interest rates change infrequently but are important)
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(processedRows));
      } catch (redisError) {
        logger.warn('Failed to cache interest data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      logger.info('Interest data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        resultCount: rows.length,
        cacheHit: false
      });

      return createSuccessResponse(
        processedRows,
        'Interest rates retrieved successfully',
        getCacheHeaders('MISS', 300, 'interest')
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
    logger.error('Error in interest handler', {
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

export const GET = withPublicApi(interestHandler);
