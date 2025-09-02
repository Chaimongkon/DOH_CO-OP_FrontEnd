import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import logger from "@/lib/logger";
import { createSuccessResponse, getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { DatabaseError, ApiError, ValidationError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";
import redis from "@/lib/db/redis";

export const dynamic = "force-dynamic";

interface CandidateRow extends RowDataPacket {
  Id: number;
  Member: string;
  IdCard: string;
  FullName: string;
  Department: string;
  FieldNumber: string;
  SequenceNumber: string;
}

interface CandidatesResponse {
  data: CandidateRow[];
  total: number;
  search?: string;
}

async function candidatesHandler(
  request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    // Extract search parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 100); // Max 100 results
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Validate search parameter
    if (search && (search.length < 2 || search.length > 50)) {
      throw new ValidationError("Search term must be between 2 and 50 characters", "search");
    }

    // Create cache key
    const cacheKey = `candidates:${search || 'all'}:${limit}:${offset}`;
    
    try {
      // Try to get from cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Candidates data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          search,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult) as CandidatesResponse;
        return createSuccessResponse(data, 'Election candidates retrieved successfully', 
          getCacheHeaders('HIT', 1800, 'candidates')
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

    // Build query parameters
    const searchTermParams: (string | number)[] = [];
    const queryParams: (string | number)[] = [];
    const countParams: (string | number)[] = [];
    
    let query = `
      SELECT Id, Member, IdCard, FullName, Department, FieldNumber, SequenceNumber
      FROM election
    `;
    
    let countQuery = `SELECT COUNT(*) as total FROM election`;

    // Add search filter if present
    if (search) {
      const whereClause = " WHERE Member LIKE ? OR IdCard LIKE ? OR FullName LIKE ? OR Department LIKE ?";
      query += whereClause;
      countQuery += whereClause;
      const searchTerm = `%${search}%`;
      searchTermParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      queryParams.push(...searchTermParams);
      countParams.push(...searchTermParams);
    }

    // Add pagination to main query only
    query += " ORDER BY Id DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    try {
      // Execute queries in parallel
      const [rowsResult, countResult] = await Promise.all([
        db.execute(query, queryParams) as Promise<[CandidateRow[], FieldPacket[]]>,
        db.execute(countQuery, countParams) as Promise<[RowDataPacket[], FieldPacket[]]>
      ]);

      const [rows] = rowsResult;
      const [countRows] = countResult;
      const total = (countRows[0] as { total: number }).total;

      const responseData: CandidatesResponse = {
        data: rows,
        total,
        search: search || undefined
      };

      // Cache the result for 30 minutes
      try {
        await redis.setex(cacheKey, 1800, JSON.stringify(responseData));
      } catch (redisError) {
        logger.warn('Failed to cache candidates data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      logger.info('Candidates data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        search,
        resultCount: rows.length,
        total,
        cacheHit: false
      });

      return createSuccessResponse(
        responseData,
        'Election candidates retrieved successfully',
        getCacheHeaders('MISS', 1800, 'candidates')
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
    logger.error('Error in candidates handler', {
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

export const GET = withPublicApi(candidatesHandler);