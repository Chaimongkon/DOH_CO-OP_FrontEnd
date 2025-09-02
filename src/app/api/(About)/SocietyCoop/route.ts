import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import redis from "@/lib/db/redis";
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface SocietyRow extends RowDataPacket {
  Id: number;
  ImagePath: string;
  SocietyType: string;
  IsActive: boolean;
}

// Error response interface
interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  timestamp: string;
}

export async function GET() {
  let db;
  const timestamp = new Date().toISOString();
  const cacheKey = "society:coop:all";
  const cacheExpiry = 3600; // 1 hour

  try {
    // Check Redis cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.info("SocietyCoop data served from cache");
        const parsedData = JSON.parse(cachedData);
        return NextResponse.json(parsedData, { 
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            'X-Cache': 'HIT',
            'X-Cache-Time': new Date().toISOString(),
          }
        });
      }
    } catch (cacheError) {
      logger.warn("Redis cache read failed for SocietyCoop", { error: cacheError });
      // Continue to database if cache fails
    }

    // Database connection with timeout
    db = await pool.getConnection();
    
    if (!db) {
      logger.error("Failed to get database connection for SocietyCoop");
      return NextResponse.json<ErrorResponse>(
        {
          error: "Database Connection Failed",
          message: "Unable to establish connection to the database",
          code: "DB_CONNECTION_ERROR",
          timestamp
        },
        { status: 503 }
      );
    }

    const query = `SELECT Id, ImagePath, SocietyType, IsActive FROM cooperativesociety ORDER BY Id ASC`;

    // Execute query with error handling
    const [rows]: [SocietyRow[], FieldPacket[]] = await db.query(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      logger.error("Invalid query result format for SocietyCoop");
      return NextResponse.json<ErrorResponse>(
        {
          error: "Invalid Data Format",
          message: "Database returned unexpected data format",
          code: "INVALID_DATA_FORMAT",
          timestamp
        },
        { status: 500 }
      );
    }

    // Process and validate each row
    const processedRows = rows.map((row: SocietyRow) => {
      // Validate required fields
      if (!row.Id || !row.SocietyType) {
        logger.warn(`Incomplete society data for ID: ${row.Id}`);
      }

      return {
        ...row,
        ImagePath: row.ImagePath
          ? `/SocietyCoop/File/${path.basename(row.ImagePath)}`
          : null,
      };
    });

    // Filter active records
    const activeRecords = processedRows.filter(row => row.IsActive);

    logger.info(`Successfully fetched ${activeRecords.length} active society records out of ${processedRows.length} total`);
    
    // Cache the processed data in Redis
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("SocietyCoop data cached successfully");
    } catch (cacheError) {
      logger.warn("Failed to cache society data", { error: cacheError });
      // Don't fail the request if caching fails
    }
    
    return NextResponse.json(processedRows, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Cache': 'MISS',
        'X-Cache-Time': timestamp,
        'X-Total-Records': processedRows.length.toString(),
        'X-Active-Records': activeRecords.length.toString(),
      }
    });

  } catch (error) {
    // Enhanced error logging
    logger.error("Error in SocietyCoop API:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp
    });

    // Determine specific error type and status code
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Database Connection Timeout",
            message: "Database server is not responding",
            code: "DB_TIMEOUT",
            timestamp
          },
          { status: 503 }
        );
      }

      // Table doesn't exist error
      if (error.message.includes('Table') && error.message.includes('doesn\'t exist')) {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Table Not Found",
            message: "The cooperativesociety table was not found in the database",
            code: "TABLE_NOT_FOUND",
            timestamp
          },
          { status: 500 }
        );
      }

      // SQL syntax or constraint errors
      if (error.message.includes('ER_') || error.message.includes('SQL')) {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Database Query Error",
            message: "Error executing database query for society data",
            code: "DB_QUERY_ERROR",
            timestamp
          },
          { status: 500 }
        );
      }
    }

    // Generic server error
    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching society data",
        code: "INTERNAL_ERROR",
        timestamp
      },
      { status: 500 }
    );
  } finally {
    if (db) {
      try {
        db.release();
      } catch (releaseError) {
        logger.error("Error releasing database connection in SocietyCoop", releaseError);
      }
    }
  }
}