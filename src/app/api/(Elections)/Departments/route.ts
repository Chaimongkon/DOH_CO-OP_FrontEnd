import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";
import { createPaginatedResponse, getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { DatabaseError, ApiError, ValidationError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";
import redis from "@/lib/db/redis";

export const dynamic = 'force-dynamic';

interface DepartmentRow extends RowDataPacket {
  Id: number;
  DepartmentName: string;
  FilePath: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface ProcessedDepartment {
  Id: number;
  DepartmentName: string;
  FilePath: string | null;
}

async function departmentsHandler(
  request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const per_page = Math.min(Math.max(parseInt(searchParams.get('per_page') || '10', 10), 1), 50); // Max 50 per page
    const search = searchParams.get('search');
    const start_idx = (page - 1) * per_page;

    // Validate search parameter
    if (search && (search.length < 2 || search.length > 100)) {
      throw new ValidationError("Search term must be between 2 and 100 characters", "search");
    }

    // Create cache key
    const cacheKey = `departments:${search || 'all'}:${page}:${per_page}`;
    
    try {
      // Try to get from cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Departments data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          page,
          per_page,
          search,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult);
        return createPaginatedResponse(
          data.processedRows,
          page,
          per_page,
          data.total,
          'Election departments retrieved successfully',
          getCacheHeaders('HIT', 1800, 'departments')
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

    const params: (string | number)[] = [];

    let query = `
      SELECT SQL_CALC_FOUND_ROWS Id, DepartmentName, FilePath
      FROM electiondepartment
    `;

    // Add search filter if present
    if (search) {
      query += " WHERE DepartmentName LIKE ?";
      params.push(`%${search}%`);
    }

    // Add ordering and pagination
    query += ` ORDER BY Id ASC LIMIT ?, ?`;
    params.push(start_idx, per_page);

    try {
      // Execute the queries
      const [rows]: [DepartmentRow[], FieldPacket[]] = await db.execute(query, params);
      
      // Get the total count of records
      const [counts]: [CountRow[], FieldPacket[]] = await db.query("SELECT FOUND_ROWS() AS total");
      const total = counts[0].total;

      // Process the rows to format file paths
      const processedRows: ProcessedDepartment[] = rows.map((row: DepartmentRow) => ({
        ...row,
        FilePath: row.FilePath
          ? `/ElectionDepartment/File/${path.basename(row.FilePath)}`
          : null, // Handle null or undefined FilePath
      }));

      // Cache the result for 30 minutes
      try {
        await redis.setex(cacheKey, 1800, JSON.stringify({ processedRows, total }));
      } catch (redisError) {
        logger.warn('Failed to cache departments data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      logger.info('Departments data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        page,
        per_page,
        search,
        resultCount: rows.length,
        total,
        cacheHit: false
      });

      return createPaginatedResponse(
        processedRows,
        page,
        per_page,
        total,
        'Election departments retrieved successfully',
        getCacheHeaders('MISS', 1800, 'departments')
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
    logger.error('Error in departments handler', {
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

export const GET = withPublicApi(departmentsHandler);