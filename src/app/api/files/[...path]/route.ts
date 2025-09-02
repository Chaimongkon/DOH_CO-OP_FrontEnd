import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";
import logger from "@/lib/logger";
import { RateLimiter } from "@/lib/validation";

// Rate limiting for file access - 1000 requests per minute per IP
const fileAccessLimiter = new RateLimiter(1000, 60 * 1000);

// Security configuration for different file categories
const FILE_CATEGORIES = {
  'News': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/News/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  'Slides': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/Slides/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  'PhotoAlbum': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/PhotoAlbum/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  'PhotoAll': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/PhotoAlbum/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  'DialogBoxs': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/DialogBoxs/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  'PhotosCover': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/PhotosCover/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  'BusinessReport': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/BusinessReport/",
    allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.webp'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  'Application': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/Application/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  'DownloadForm': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/FileDownload/",
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  'Serve': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/Services/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  'SRD': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/SRD/",
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  'ElectionDepartment': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/ElectionDepartment/",
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  'Organizational': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/TreeOrganizational/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
    maxFileSize: 20 * 1024 * 1024 // 20MB
  },
  'SocietyCoop': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/CoopSociety/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  'Particles': {
    baseDir: process.env.NEXT_PUBLIC_URL_BASE_DIR + "/Particles/",
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov'],
    maxFileSize: 20 * 1024 * 1024 // 20MB
  }
};

/**
 * Centralized file serving endpoint
 * Handles all file requests with proper security, validation, and logging
 * 
 * URL Format: /api/files/{category}/File/{...path}
 * Examples:
 * - /api/files/News/File/image.jpg
 * - /api/files/BusinessReport/File/report.pdf
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // Rate limiting check
    if (!fileAccessLimiter.isAllowed(clientIP)) {
      logger.warn(`File access rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Validate path structure
    if (!params.path || params.path.length < 3) {
      return NextResponse.json(
        { error: "Invalid file path structure" },
        { status: 400 }
      );
    }

    const [category, fileKeyword, ...filePath] = params.path;
    
    // Validate that second segment is "File"
    if (fileKeyword !== 'File') {
      return NextResponse.json(
        { error: "Invalid file path - missing 'File' segment" },
        { status: 400 }
      );
    }

    // Validate category
    const categoryConfig = FILE_CATEGORIES[category as keyof typeof FILE_CATEGORIES];
    if (!categoryConfig) {
      logger.warn(`Invalid file category requested: ${category} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Invalid file category" },
        { status: 400 }
      );
    }

    // Construct file path
    const requestedFilePath = filePath.join('/');
    const fullFilePath = path.join(categoryConfig.baseDir, requestedFilePath);
    
    // Security: Resolve path and ensure it's within the allowed directory
    const resolvedFilePath = path.resolve(fullFilePath);
    const resolvedBaseDir = path.resolve(categoryConfig.baseDir);
    
    if (!resolvedFilePath.startsWith(resolvedBaseDir)) {
      logger.warn(`Path traversal attempt: ${requestedFilePath} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Validate file extension - allow files without extension for PhotoAlbum
    const fileExtension = path.extname(resolvedFilePath).toLowerCase();
    if (fileExtension && !categoryConfig.allowedExtensions.includes(fileExtension)) {
      logger.warn(`Disallowed file extension: ${fileExtension} for category: ${category} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 403 }
      );
    }
    
    // For PhotoAlbum and PhotoAll categories, allow files without extension (assume they are images)
    if (!fileExtension && !['PhotoAlbum', 'PhotoAll'].includes(category)) {
      logger.warn(`File without extension not allowed for category: ${category} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 403 }
      );
    }

    // Check if file exists
    let fileStats;
    try {
      fileStats = await fs.stat(resolvedFilePath);
    } catch {
      logger.info(`File not found: ${requestedFilePath} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Validate file size
    if (fileStats.size > categoryConfig.maxFileSize) {
      logger.warn(`File too large: ${fileStats.size} bytes for ${requestedFilePath} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "File too large" },
        { status: 413 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(resolvedFilePath);
    
    // Determine content type
    let contentType = mime.lookup(fileExtension) || "application/octet-stream";
    
    // For files without extension in PhotoAlbum or PhotoAll, detect from file content
    if (!fileExtension && ['PhotoAlbum', 'PhotoAll'].includes(category)) {
      const buffer = fileBuffer.slice(0, 12);
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        contentType = "image/jpeg";
      } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        contentType = "image/png";
      } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        contentType = "image/gif";
      } else if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        contentType = "image/webp";
      } else {
        contentType = "image/jpeg"; // Default to JPEG for images without extension
      }
    }
    
    // Log successful access
    logger.info(`File served: ${category}/${requestedFilePath} (${fileStats.size} bytes) to IP: ${clientIP}`);

    // Set appropriate headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': fileStats.size.toString(),
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Last-Modified': fileStats.mtime.toUTCString(),
    });

    // Set Content-Disposition for downloads (PDFs, docs, etc.)
    if (['.pdf', '.doc', '.docx', '.xls', '.xlsx'].includes(fileExtension)) {
      const fileName = path.basename(resolvedFilePath);
      headers.set('Content-Disposition', `inline; filename="${fileName}"`);
    }

    return new NextResponse(fileBuffer, { 
      status: 200,
      headers 
    });

  } catch (error) {
    logger.error(`File serving error from IP ${clientIP}`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}