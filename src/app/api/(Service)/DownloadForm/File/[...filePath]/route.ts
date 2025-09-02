//api/(Service)/DownloadForm/File/[...filePath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import mime from 'mime-types';
import { validateFilePath } from '@/lib/validation';
import logger from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { filePath: string[] } }) {
  const context = {
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  };
  try {
    const baseDir = process.env.NEXT_PUBLIC_URL_BASE_DIR;
    if (!baseDir) {
      logger.error('NEXT_PUBLIC_URL_BASE_DIR environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const downloadDir = path.join(baseDir, 'FileDownload');
    
    // Validate file path and prevent path traversal
    let resolvedFilePath: string;
    try {
      resolvedFilePath = validateFilePath(downloadDir, params.filePath);
    } catch (error) {
      logger.security('Path traversal attempt detected', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestedPath: params.filePath,
        downloadDir,
        ip: context.ip,
        userAgent: context.userAgent,
        severity: 'high'
      });
      
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Check file extension - only allow safe file types
    const fileExtension = path.extname(resolvedFilePath).toLowerCase();
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.rtf', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar'
    ];
    
    if (!allowedExtensions.includes(fileExtension)) {
      logger.security('Attempted access to restricted file type', {
        extension: fileExtension,
        file: resolvedFilePath,
        ip: context.ip,
        userAgent: context.userAgent,
        severity: 'medium'
      });
      
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 403 }
      );
    }

    // Check if the file exists
    let stats;
    try {
      stats = await fs.stat(resolvedFilePath);
    } catch (error) {
      logger.warn('File access attempt failed', {
        file: params.filePath.join('/'),
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: context.ip
      });
      
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Check file size (limit to 50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (stats.size > maxFileSize) {
      logger.warn('Large file access attempt', {
        file: resolvedFilePath,
        size: stats.size,
        ip: context.ip
      });
      
      return NextResponse.json(
        { success: false, error: 'File too large' },
        { status: 413 }
      );
    }

    // Read the file
    const file = await fs.readFile(resolvedFilePath);
    
    // Determine the content type
    const contentType = mime.lookup(fileExtension) || 'application/octet-stream';
    const fileName = path.basename(resolvedFilePath);

    // Log successful file access
    logger.info('File download served', {
      file: fileName,
      size: stats.size,
      contentType,
      ip: context.ip,
      userAgent: context.userAgent
    });

    // Return the file with secure headers
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
    
  } catch (error) {
    logger.error('Error serving DownloadForm file', {
      error: error instanceof Error ? error.message : String(error),
      requestedPath: params.filePath,
      ip: context.ip,
      userAgent: context.userAgent
    });
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

