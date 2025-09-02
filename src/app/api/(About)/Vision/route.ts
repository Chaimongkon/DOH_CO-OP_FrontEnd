import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import redis from "@/lib/db/redis";
import { RowDataPacket, FieldPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface VisionSocietyRow extends RowDataPacket {
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
  const cacheKey = "vision:mission:values";
  const cacheExpiry = 7200; // 2 hours (vision data changes less frequently)

  try {
    // Check Redis cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.info("Vision data served from cache");
        const parsedData = JSON.parse(cachedData);
        return NextResponse.json(parsedData, { 
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=86400',
            'X-Cache': 'HIT',
            'X-Cache-Time': new Date().toISOString(),
            'X-Data-Type': 'vision-mission-values',
          }
        });
      }
    } catch (cacheError) {
      logger.warn("Redis cache read failed for Vision", { error: cacheError });
      // Continue to database if cache fails
    }

    // Database connection with validation
    db = await pool.getConnection();
    
    if (!db) {
      logger.error("Failed to get database connection for Vision API");
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

    // Query specifically for vision-related society data
    const query = `SELECT Id, ImagePath, SocietyType, IsActive FROM cooperativesociety WHERE SocietyType LIKE '%วิสัยทัศน%' OR SocietyType LIKE '%พันธกิจ%' OR SocietyType LIKE '%ค่านิยม%' ORDER BY Id ASC`;

    // Execute query with error handling
    const [rows]: [VisionSocietyRow[], FieldPacket[]] = await db.query(query);

    // Validate query results
    if (!Array.isArray(rows)) {
      logger.error("Invalid query result format for Vision data");
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
    const processedRows = rows.map((row: VisionSocietyRow) => {
      // Validate required fields
      if (!row.Id || !row.SocietyType) {
        logger.warn(`Incomplete vision society data for ID: ${row.Id}`);
      }

      // Check if ImagePath exists and is valid
      if (row.ImagePath && !row.ImagePath.trim()) {
        logger.warn(`Empty ImagePath for vision society ID: ${row.Id}`);
      }

      return {
        ...row,
        ImagePath: row.ImagePath && row.ImagePath.trim()
          ? `/SocietyCoop/File/${path.basename(row.ImagePath)}`
          : null,
      };
    });

    // Filter for active vision/mission/values records
    const activeVisionRecords = processedRows.filter(row => 
      row.IsActive && 
      row.SocietyType && 
      (row.SocietyType.includes('วิสัยทัศน์') || 
       row.SocietyType.includes('พันธกิจ') || 
       row.SocietyType.includes('ค่านิยม'))
    );

    // Check if any vision data exists
    if (processedRows.length === 0) {
      logger.warn("No vision/mission/values data found in database");
      return NextResponse.json<ErrorResponse>(
        {
          error: "No Data Found",
          message: "No vision, mission, or values data available",
          code: "NO_VISION_DATA",
          timestamp
        },
        { status: 404 }
      );
    }

    logger.info(`Successfully fetched ${activeVisionRecords.length} active vision records out of ${processedRows.length} total vision records`);
    
    // Cache the processed data in Redis with longer expiry
    try {
      await redis.setex(cacheKey, cacheExpiry, JSON.stringify(processedRows));
      logger.info("Vision data cached successfully");
    } catch (cacheError) {
      logger.warn("Failed to cache vision data", { error: cacheError });
      // Don't fail the request if caching fails
    }
    
    return NextResponse.json(processedRows, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=86400',
        'X-Cache': 'MISS',
        'X-Cache-Time': timestamp,
        'X-Total-Records': processedRows.length.toString(),
        'X-Active-Records': activeVisionRecords.length.toString(),
        'X-Data-Type': 'vision-mission-values',
      }
    });

  } catch (error) {
    // Enhanced error logging with context
    logger.error("Error in Vision API:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp,
      context: "Vision/Mission/Values data fetch"
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

      // Column doesn't exist error
      if (error.message.includes('Unknown column')) {
        return NextResponse.json<ErrorResponse>(
          {
            error: "Column Not Found",
            message: "Required database columns are missing",
            code: "COLUMN_NOT_FOUND", 
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
            message: "Error executing database query for vision data",
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
        message: "An unexpected error occurred while fetching vision data",
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
        logger.error("Error releasing database connection in Vision API", releaseError);
      }
    }
  }
}