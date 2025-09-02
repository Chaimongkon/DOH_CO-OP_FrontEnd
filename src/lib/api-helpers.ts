/**
 * API Helper Functions
 * Utility functions for consistent API responses
 */

import { NextResponse } from "next/server";
import {
  SuccessApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
  ApiErrorCodes,
  HttpStatusCodes,
  CacheHeaders
} from "@/types/api-responses";
import logger from "@/lib/logger";

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  headers?: CacheHeaders
): NextResponse<SuccessApiResponse<T>> {
  const response: SuccessApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    message
  };

  return NextResponse.json(response, {
    status: HttpStatusCodes.OK,
    headers: headers as Record<string, string>
  });
}

// Error response helper
export function createErrorResponse(
  error: string,
  code?: ApiErrorCodes,
  status: HttpStatusCodes = HttpStatusCodes.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
): NextResponse<ErrorApiResponse> {
  const response: ErrorApiResponse = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
    details
  };

  // Log error for monitoring
  logger.error(`API Error: ${error}`, { code, status, details });

  return NextResponse.json(response, { status });
}

// Paginated response helper
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  per_page: number,
  total: number,
  message?: string,
  headers?: CacheHeaders
): NextResponse<PaginatedApiResponse<T>> {
  const pageCount = Math.ceil(total / per_page);
  
  const response: PaginatedApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    message,
    pagination: {
      page,
      per_page,
      total,
      pageCount,
      hasNext: page < pageCount,
      hasPrev: page > 1
    }
  };

  return NextResponse.json(response, {
    status: HttpStatusCodes.OK,
    headers: headers as Record<string, string>
  });
}

// Common cache headers
export const getCacheHeaders = (
  cacheStatus: 'HIT' | 'MISS',
  maxAge: number = 3600,
  dataType?: string
): CacheHeaders => ({
  'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
  'X-Cache': cacheStatus,
  'X-Cache-Time': new Date().toISOString(),
  ...(dataType && { 'X-Data-Type': dataType })
});

// Database error handler
export function handleDatabaseError(error: unknown): NextResponse<ErrorApiResponse> {
  if (error instanceof Error) {
    // Connection timeout
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      return createErrorResponse(
        "Database server is not responding",
        ApiErrorCodes.DB_TIMEOUT,
        HttpStatusCodes.SERVICE_UNAVAILABLE
      );
    }

    // SQL errors
    if (error.message.includes('ER_') || error.message.includes('SQL')) {
      return createErrorResponse(
        "Error executing database query",
        ApiErrorCodes.DB_QUERY_ERROR,
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Generic database error
  return createErrorResponse(
    "An unexpected database error occurred",
    ApiErrorCodes.DB_CONNECTION_ERROR,
    HttpStatusCodes.INTERNAL_SERVER_ERROR
  );
}

// Validation error handler
export function createValidationError(
  field: string,
  message: string
): NextResponse<ErrorApiResponse> {
  return createErrorResponse(
    `Invalid ${field}: ${message}`,
    ApiErrorCodes.INVALID_INPUT,
    HttpStatusCodes.BAD_REQUEST,
    { field, validation_message: message }
  );
}

// Rate limit error
export function createRateLimitError(
  message: string = "Too many requests. Please try again later."
): NextResponse<ErrorApiResponse> {
  return createErrorResponse(
    message,
    ApiErrorCodes.RATE_LIMIT_EXCEEDED,
    HttpStatusCodes.TOO_MANY_REQUESTS
  );
}