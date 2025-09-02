import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";
import logger from "@/lib/logger";
import { getCacheHeaders } from "@/lib/api-helpers";
import { withPublicApi, ApiRequestContext } from "@/lib/api-middleware";
import { ApiError, FileNotFoundError, ValidationError } from "@/lib/api-errors";
import { ApiErrorCodes } from "@/types/api-responses";

interface FilePathParams {
  filePath: string[];
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for business reports
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xlsx', '.xls', '.pptx', '.ppt', '.txt',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff', '.svg'
];

async function businessReportFileHandler(
  request: NextRequest,
  context: ApiRequestContext,
  { params }: { params: FilePathParams }
): Promise<NextResponse> {
  logger.info('BusinessReport handler started', {
    filePath: params?.filePath,
    requestId: context.requestId
  });
  
  try {
    // Validate file path parameters
    if (!params.filePath || params.filePath.length === 0) {
      throw new ValidationError("File path is required", "filePath");
    }

    // Construct and validate the file path
    const urlBaseDir = process.env.NEXT_PUBLIC_URL_BASE_DIR;
    
    logger.info('Environment check', {
      urlBaseDir,
      requestId: context.requestId
    });
    
    if (!urlBaseDir) {
      logger.error("NEXT_PUBLIC_URL_BASE_DIR environment variable not set", {
        requestId: context.requestId,
        ip: context.ip
      });
      throw new ApiError("File serving not configured", ApiErrorCodes.CONFIG_ERROR, 500);
    }
    
    const baseDir = urlBaseDir + "/BusinessReport";

    const filePath = path.join(baseDir, ...params.filePath);
    const resolvedFilePath = path.resolve(filePath);
    const resolvedBaseDir = path.resolve(baseDir);

    // Security: Prevent directory traversal attacks
    if (!resolvedFilePath.startsWith(resolvedBaseDir)) {
      logger.security("Directory traversal attempt detected", {
        requestId: context.requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        attemptedPath: params.filePath.join('/'),
        severity: 'high'
      });
      throw new ValidationError("Invalid file path - directory traversal not allowed", "filePath");
    }

    // Validate file extension
    const fileExtension = path.extname(resolvedFilePath).toLowerCase();
    
    // Debug: Log file extension for troubleshooting
    logger.info('BusinessReport file validation', {
      fileExtension,
      isAllowed: ALLOWED_EXTENSIONS.includes(fileExtension),
      requestId: context.requestId
    });
    
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new ValidationError(`File type not allowed: ${fileExtension}`, "fileExtension");
    }

    // Check if file exists and get stats
    let stats;
    try {
      stats = await fs.stat(resolvedFilePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new FileNotFoundError("Business report file not found", resolvedFilePath);
      }
      throw new ApiError(`File access error: ${(error as Error).message}`, ApiErrorCodes.FILE_ACCESS_ERROR, 500);
    }

    // Validate file size
    if (stats.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File too large: ${stats.size} bytes (max: ${MAX_FILE_SIZE})`, "fileSize");
    }

    // Read the file
    const file = await fs.readFile(resolvedFilePath);
    
    // Determine content type
    const contentType = mime.lookup(fileExtension) || "application/octet-stream";
    
    // Set caching headers for business reports (moderate cache)
    const cacheHeaders = getCacheHeaders('HIT', 43200, 'business-report'); // 12 hours cache
    
    logger.info('Business report file served successfully', {
      requestId: context.requestId,
      ip: context.ip,
      filePath: params.filePath.join('/'),
      fileSize: stats.size,
      contentType,
      documentType: 'business-report'
    });

    // Return file with proper headers
    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": stats.size.toString(),
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": fileExtension === '.pdf' ? 'inline' : 'attachment',
      "X-Frame-Options": "SAMEORIGIN",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Add cache headers if they exist
    if (cacheHeaders['Cache-Control']) responseHeaders['Cache-Control'] = cacheHeaders['Cache-Control'];
    if (cacheHeaders['X-Cache']) responseHeaders['X-Cache'] = cacheHeaders['X-Cache'];
    if (cacheHeaders['X-Cache-Time']) responseHeaders['X-Cache-Time'] = cacheHeaders['X-Cache-Time'];
    if (cacheHeaders['X-Data-Type']) responseHeaders['X-Data-Type'] = cacheHeaders['X-Data-Type'];

    return new NextResponse(file, {
      headers: responseHeaders
    });
    
  } catch (error) {
    logger.error('Error serving business report file', {
      error: error instanceof Error ? error.message : String(error),
      requestId: context.requestId,
      ip: context.ip,
      filePath: params.filePath?.join('/'),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error; // Re-throw to be handled by middleware
  }
}

export const GET = withPublicApi(businessReportFileHandler);
