import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";
import logger from "@/lib/logger";
import { getFileApiSecurityHeaders, getCorsPreflightHeaders } from "@/lib/api-security";

export async function GET(
  req: NextRequest,
  { params }: { params: { filePath: string[] } }
) {
  try {
    // Construct the full file path using server-side environment variable
    const baseDir = process.env.FILE_UPLOAD_BASE_DIR 
      ? path.join(process.env.FILE_UPLOAD_BASE_DIR, "Services")
      : path.join(process.cwd(), "public", "Uploads", "Services");
    const filePath = path.join(baseDir, ...params.filePath);

    // Use path.resolve to ensure the resolved path is within the baseDir
    const resolvedFilePath = path.resolve(filePath);
    const resolvedBaseDir = path.resolve(baseDir);
    
    // Security: Prevent path traversal attacks
    if (!resolvedFilePath.startsWith(resolvedBaseDir)) {
      logger.warn(`Path traversal attempt blocked: ${resolvedFilePath}`, {
        clientIP: req.ip || req.headers.get('x-forwarded-for'),
        userAgent: req.headers.get('user-agent'),
        requestedPath: params.filePath.join('/')
      });
      return NextResponse.json({ 
        success: false,
        error: "Access denied",
        message: "Invalid file path" 
      }, { 
        status: 403,
        headers: getFileApiSecurityHeaders()
      });
    }

    // Check if the file exists
    const fileExists = await fs
      .access(resolvedFilePath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      logger.info(`File not found: ${resolvedFilePath}`, {
        requestedPath: params.filePath.join('/'),
        clientIP: req.ip || req.headers.get('x-forwarded-for')
      });
      return NextResponse.json({ 
        success: false,
        error: "File not found",
        message: "The requested file does not exist" 
      }, { 
        status: 404,
        headers: getFileApiSecurityHeaders()
      });
    }

    // Read the file
    const file = await fs.readFile(resolvedFilePath);
    const fileExtension = path.extname(resolvedFilePath).toLowerCase();

    // Determine the content type using mime-types library
    const contentType =
      mime.lookup(fileExtension) || "application/octet-stream";

    // Return the file as a response with the appropriate content type and CORS headers
    return new NextResponse(file, { 
      headers: getFileApiSecurityHeaders({ "Content-Type": contentType })
    });
  } catch (error) {
    const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    logger.error(`Error serving file from IP ${clientIP}`, error);
    logger.info("File serving error context:", {
      requestedPath: params.filePath.join('/'),
      clientIP,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to serve file" 
      },
      { 
        status: 500,
        headers: getFileApiSecurityHeaders()
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  
  logger.info('CORS preflight request for File API', { 
    clientIP,
    origin: req.headers.get('origin'),
    userAgent: req.headers.get('user-agent')
  });

  return new NextResponse(null, {
    status: 200,
    headers: getCorsPreflightHeaders('GET, OPTIONS'),
  });
}