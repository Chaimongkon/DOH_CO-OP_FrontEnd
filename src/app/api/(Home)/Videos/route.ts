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

interface VideoRow extends RowDataPacket {
  Id: number;
  Title: string; 
  YouTubeUrl: string;  
  Details: string;
}

interface ProcessedVideo {
  Id: number;
  Title: string;
  YouTubeUrl: string;
  Details: string;
  embedUrl?: string;
  thumbnail?: string;
}

// Function to extract YouTube video ID and generate embed URLs
function processYouTubeUrl(url: string): { embedUrl: string; thumbnail: string } | null {
  if (!url) return null;
  
  // Extract video ID from various YouTube URL formats
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  
  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
  }
  
  return null;
}

async function videosHandler(
  request: NextRequest,
  context: ApiRequestContext
): Promise<NextResponse> {
  let db;
  
  try {
    const cacheKey = 'videos:all';
    
    try {
      // Try to get from cache first (10 minute cache for videos)
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info('Videos data served from cache', {
          requestId: context.requestId,
          ip: context.ip,
          cacheHit: true
        });
        
        const data = JSON.parse(cachedResult) as ProcessedVideo[];
        return createSuccessResponse(data, 'Videos retrieved successfully', 
          getCacheHeaders('HIT', 600, 'videos')
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
      const query = "SELECT Id, Title, YouTubeUrl, Details FROM videos ORDER BY Id DESC";
      const [rows]: [VideoRow[], FieldPacket[]] = await db.execute(query);

      // Process the rows to add YouTube embed URLs and thumbnails
      const processedRows: ProcessedVideo[] = rows.map((row) => {
        const processed: ProcessedVideo = { ...row };
        
        // Process YouTube URL to get embed URL and thumbnail
        const youtubeData = processYouTubeUrl(row.YouTubeUrl);
        if (youtubeData) {
          processed.embedUrl = youtubeData.embedUrl;
          processed.thumbnail = youtubeData.thumbnail;
        }
        
        return processed;
      });

      // Cache the result for 10 minutes
      try {
        await redis.setex(cacheKey, 600, JSON.stringify(processedRows));
      } catch (redisError) {
        logger.warn('Failed to cache videos data', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
          requestId: context.requestId
        });
      }

      logger.info('Videos data retrieved successfully', {
        requestId: context.requestId,
        ip: context.ip,
        resultCount: rows.length,
        cacheHit: false
      });

      return createSuccessResponse(
        processedRows,
        'Videos retrieved successfully',
        getCacheHeaders('MISS', 600, 'videos')
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
    logger.error('Error in videos handler', {
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

export const GET = withPublicApi(videosHandler);
