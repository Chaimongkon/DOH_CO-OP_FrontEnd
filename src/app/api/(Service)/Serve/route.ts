import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import logger from "@/lib/logger";
import { FieldPacket } from "mysql2";
import { getDataApiSecurityHeaders, getCorsPreflightHeaders } from "@/lib/api-security";
import { ServicesRow } from "@/types/database";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let db;
  const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    // Log the request for monitoring
    logger.info('Services data request', { 
      clientIP, 
      userAgent,
      timestamp: new Date().toISOString()
    });

    db = await pool.getConnection();

    // Query services data
    const query = `SELECT Id, ImagePath, Subcategories, URLLink FROM services`;
    
    const [rows]: [ServicesRow[], FieldPacket[]] = await db.query(query);

    // Check for null or undefined values in ImagePath and handle them
    const processedRows = rows.map((row: ServicesRow) => ({
      ...row,
      ImagePath: row.ImagePath && row.ImagePath.trim()
        ? `/Serve/File/${path.basename(row.ImagePath)}`
        : null,
      IsActive: row.IsActive ?? true, // Default to true if column doesn't exist
    }));

    logger.info('Services data retrieved successfully', {
      clientIP,
      count: processedRows.length,
      userAgent
    });

    return NextResponse.json({
      success: true,
      data: processedRows,
      total: processedRows.length,
      message: "Services data retrieved successfully"
    }, { 
      status: 200,
      headers: getDataApiSecurityHeaders()
    });
  } catch (error) {
    logger.error(`Error fetching services data from IP ${clientIP}`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.info("Error context details:", { 
      error: errorMessage, 
      stack: error instanceof Error ? error.stack : undefined,
      clientIP,
      userAgent,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: "Internal Server Error",
        message: "Failed to retrieve services data",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
      },
      { 
        status: 500,
        headers: getDataApiSecurityHeaders()
      }
    );
  } finally {
    if (db) db.release();
  }
}

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  const clientIP = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  
  logger.info('CORS preflight request for Services API', { 
    clientIP,
    origin: req.headers.get('origin'),
    userAgent: req.headers.get('user-agent')
  });

  return new NextResponse(null, {
    status: 200,
    headers: getCorsPreflightHeaders('GET, OPTIONS'),
  });
}
