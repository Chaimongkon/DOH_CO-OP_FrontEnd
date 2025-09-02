/**
 * Optimized News API with Database Pool and Query Cache
 * This is an example of how to migrate existing APIs to use the new optimized system
 */

import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import path from "path";
import logger from "@/lib/logger";
import { queryHelper, queries } from "@/lib/db/query-helper";
import { 
  createSuccessResponse, 
  getCacheHeaders 
} from "@/lib/api-helpers";
import { 
  withPublicApi, 
  ApiRequestContext 
} from "@/lib/api-middleware";
import { 
  ApiError,
  ValidationError 
} from "@/lib/api-errors";

export const dynamic = "force-dynamic";

// Define the types for the query results
interface NewsRow extends RowDataPacket {
  Id: number;
  Title: string;
  Details: string;
  ImagePath: string;
  PdfPath: string;
  CreateDate: string;
}

async function optimizedNewsHandler(request: NextRequest, context: ApiRequestContext) {
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

    const params: (string | number)[] = [];
    let baseQuery = `SELECT Id, Title, Details, ImagePath, PdfPath, CreateDate FROM news`;

    // Add search filter if present
    if (search) {
      baseQuery += " WHERE Title LIKE ?";
      params.push(`%${search}%`);
    }

    let processedRows: NewsRow[];
    let total = 0;
    let pageCount = 1;

    if (all) {
      // Get all records with caching (no search terms get longer cache)
      const cachePreset = search ? 'SHORT' : 'LONG';
      processedRows = await queries.getCached<NewsRow[]>(
        baseQuery + " ORDER BY Id DESC",
        params,
        cachePreset
      );
      total = processedRows.length;
    } else {
      // Get paginated results with short cache
      const paginatedResult = await queries.getPaginated<NewsRow>(
        baseQuery,
        params,
        {
          page,
          limit: per_page,
          orderBy: 'Id',
          orderDirection: 'DESC'
        },
        'SHORT'
      );
      
      processedRows = paginatedResult.data;
      total = paginatedResult.pagination.total;
      pageCount = paginatedResult.pagination.totalPages;
    }

    // Process file paths
    const finalRows = processedRows.map((row: NewsRow) => {
      // Validate required fields
      if (!row.Id || !row.Title) {
        logger.warn(`Incomplete news data for ID: ${row.Id}`, {
          requestId: context.requestId,
          rowId: row.Id
        });
      }

      return {
        ...row,
        ImagePath: row.ImagePath
          ? `/News/File/Image/${path.basename(row.ImagePath)}`
          : null,
        PdfPath: row.PdfPath
          ? `/News/File/Pdf/${path.basename(row.PdfPath)}`
          : null,
      };
    });

    logger.info(`Successfully fetched ${finalRows.length} news records`, {
      requestId: context.requestId,
      count: finalRows.length,
      search: search ? "with search" : "without search",
      all: all,
      cached: true // This would be set by the cache system
    });

    // Return appropriate response format
    if (all) {
      // Legacy NewsAll format - simple array for backward compatibility
      return createSuccessResponse(
        finalRows,
        `Successfully fetched ${finalRows.length} news records`,
        getCacheHeaders('HIT', 1800, 'news-optimized')
      );
    } else {
      // Pagination format
      const responseData = {
        page,
        per_page,
        total,
        pageCount,
        data: finalRows,
      };
      return createSuccessResponse(
        responseData,
        `Successfully fetched page ${page} of news records`,
        getCacheHeaders('HIT', 1800, 'news-optimized')
      );
    }

  } catch (error) {
    // Enhanced error handling
    logger.error('Optimized news API error', {
      error: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Re-throw as-is if it's already an ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert unknown errors
    throw new ApiError(
      "Unexpected error in optimized news API",
      undefined,
      500,
      undefined,
      true,
      { requestId: context.requestId }
    );
  }
}

// Example of batch operations for news management
export async function batchInsertNews(newsRecords: Omit<NewsRow, 'Id'>[]) {
  try {
    const result = await queryHelper.batchInsert('news', newsRecords, {
      batchSize: 50,
      onDuplicateKeyUpdate: true,
      insertIgnore: false
    });

    logger.info('Batch news insert completed', {
      inserted: result.insertedRows,
      affected: result.affectedRows
    });

    return result;
  } catch (error) {
    logger.error('Batch news insert failed', { error });
    throw error;
  }
}

// Example of transaction usage
export async function updateNewsWithImages(
  newsId: number,
  newsData: Partial<NewsRow>,
  imagePaths: string[]
) {
  return await queryHelper.transaction(async (tx) => {
    // Update news record
    const newsResult = await tx.execute(
      'UPDATE news SET Title = ?, Details = ?, ImagePath = ? WHERE Id = ?',
      [newsData.Title, newsData.Details, newsData.ImagePath, newsId]
    );

    if (newsResult.affectedRows === 0) {
      throw new Error('News record not found');
    }

    // Insert image records (example)
    for (const imagePath of imagePaths) {
      await tx.execute(
        'INSERT INTO news_images (news_id, image_path) VALUES (?, ?)',
        [newsId, imagePath]
      );
    }

    return { newsUpdated: true, imagesAdded: imagePaths.length };
  });
}

// Export the wrapped handler
export const GET = withPublicApi(optimizedNewsHandler);