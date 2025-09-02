/**
 * CSP Violation Reporting Endpoint
 * รับรายงานการละเมิด Content Security Policy
 */

import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get client information
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Parse CSP violation report
    const body = await request.text();
    let cspReport: unknown;
    
    try {
      cspReport = JSON.parse(body);
    } catch (parseError) {
      logger.warn('Invalid CSP report JSON:', { body, parseError });
      cspReport = { rawBody: body };
    }

    // Log CSP violation (in production, send to monitoring service)
    logger.info('CSP Violation Report:', {
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      report: cspReport
    });

    // Always return success to avoid exposing internal errors
    return NextResponse.json(
      { 
        success: true,
        message: 'CSP violation report received'
      }, 
      { 
        status: 204, // No Content - standard for CSP reports
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    logger.error('Error processing CSP violation report:', error);
    
    // Still return success to avoid exposing internal errors
    return NextResponse.json(
      { success: true },
      { status: 204 }
    );
  }
}

// Support GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'CSP Report endpoint is active',
    description: 'Send POST requests with CSP violation reports to this endpoint',
    timestamp: new Date().toISOString()
  });
}