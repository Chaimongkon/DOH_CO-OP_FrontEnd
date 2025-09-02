/**
 * Centralized API Error Handling System
 * จัดการ errors แบบมาตรฐานสำหรับ API routes ทั้งหมด
 */

import { NextResponse } from "next/server";
import { 
  ErrorApiResponse, 
  ApiErrorCodes, 
  HttpStatusCodes 
} from "@/types/api-responses";
import logger from "@/lib/logger";

// Error severity levels for monitoring
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Base API Error class
export class ApiError extends Error {
  public readonly code: ApiErrorCodes;
  public readonly statusCode: HttpStatusCodes;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ApiErrorCodes = ApiErrorCodes.INTERNAL_ERROR,
    statusCode: HttpStatusCodes = HttpStatusCodes.INTERNAL_SERVER_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.severity = severity;
    this.isOperational = isOperational;
    this.context = context;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends ApiError {
  constructor(message: string, field?: string, context?: Record<string, unknown>) {
    super(
      message,
      ApiErrorCodes.INVALID_INPUT,
      HttpStatusCodes.BAD_REQUEST,
      ErrorSeverity.LOW,
      true,
      { field, ...context }
    );
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      message,
      ApiErrorCodes.DB_CONNECTION_ERROR,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      ErrorSeverity.HIGH,
      true,
      { originalError: originalError?.message, ...context }
    );
    this.name = 'DatabaseError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests", context?: Record<string, unknown>) {
    super(
      message,
      ApiErrorCodes.RATE_LIMIT_EXCEEDED,
      HttpStatusCodes.TOO_MANY_REQUESTS,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required", context?: Record<string, unknown>) {
    super(
      message,
      ApiErrorCodes.UNAUTHORIZED,
      HttpStatusCodes.UNAUTHORIZED,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions", context?: Record<string, unknown>) {
    super(
      message,
      ApiErrorCodes.FORBIDDEN,
      HttpStatusCodes.FORBIDDEN,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
    this.name = 'AuthorizationError';
  }
}

export class FileNotFoundError extends ApiError {
  constructor(message: string = "File not found", filePath?: string, context?: Record<string, unknown>) {
    super(
      message,
      ApiErrorCodes.FILE_NOT_FOUND,
      HttpStatusCodes.NOT_FOUND,
      ErrorSeverity.LOW,
      true,
      { filePath, ...context }
    );
    this.name = 'FileNotFoundError';
  }
}

// Error detection utilities
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ER_') ||
      error.message.includes('SQL') ||
      error.message.includes('Connection') ||
      error.message.includes('Timeout')
    );
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('validation') ||
      error.message.includes('invalid') ||
      error.message.includes('required') ||
      error.message.includes('format')
    );
  }
  return false;
}

// Enhanced error categorization
export function categorizeError(error: unknown): {
  code: ApiErrorCodes;
  statusCode: HttpStatusCodes;
  severity: ErrorSeverity;
} {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return {
      code: error.code,
      statusCode: error.statusCode,
      severity: error.severity
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Database errors
    if (isDatabaseError(error)) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
        return {
          code: ApiErrorCodes.DB_TIMEOUT,
          statusCode: HttpStatusCodes.SERVICE_UNAVAILABLE,
          severity: ErrorSeverity.HIGH
        };
      }
      return {
        code: ApiErrorCodes.DB_QUERY_ERROR,
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        severity: ErrorSeverity.HIGH
      };
    }

    // Validation errors
    if (isValidationError(error)) {
      return {
        code: ApiErrorCodes.INVALID_INPUT,
        statusCode: HttpStatusCodes.BAD_REQUEST,
        severity: ErrorSeverity.LOW
      };
    }

    // Network/timeout errors
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return {
        code: ApiErrorCodes.SERVICE_UNAVAILABLE,
        statusCode: HttpStatusCodes.GATEWAY_TIMEOUT,
        severity: ErrorSeverity.MEDIUM
      };
    }
  }

  // Default fallback
  return {
    code: ApiErrorCodes.INTERNAL_ERROR,
    statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    severity: ErrorSeverity.MEDIUM
  };
}

// Centralized error handler function
export function handleApiError(
  error: unknown,
  context?: Record<string, unknown>
): NextResponse<ErrorApiResponse> {
  const timestamp = new Date().toISOString();
  
  // Handle ApiError instances
  if (error instanceof ApiError) {
    const response: ErrorApiResponse = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp,
      details: {
        ...error.context,
        ...context,
        severity: error.severity
      }
    };

    // Log based on severity
    logError(error, context);

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle standard errors
  const { code, statusCode, severity } = categorizeError(error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  const response: ErrorApiResponse = {
    success: false,
    error: errorMessage,
    code,
    timestamp,
    details: {
      ...context,
      severity,
      originalError: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : undefined
    }
  };

  // Create temporary ApiError for logging
  const tempError = new ApiError(errorMessage, code, statusCode, severity, true, context);
  logError(tempError, context);

  return NextResponse.json(response, { status: statusCode });
}

// Enhanced error logging
export function logError(error: ApiError | Error, context?: Record<string, unknown>): void {
  const logContext = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
    ...(error instanceof ApiError && {
      code: error.code,
      severity: error.severity,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      errorContext: error.context
    })
  };

  // Log based on severity
  if (error instanceof ApiError) {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error(`${error.severity.toUpperCase()} API Error: ${error.message}`, logContext);
        // TODO: Send to external monitoring service (Sentry, LogRocket, etc.)
        break;
      case ErrorSeverity.MEDIUM:
        logger.error(`API Error: ${error.message}`, logContext);
        break;
      case ErrorSeverity.LOW:
        logger.warn(`API Warning: ${error.message}`, logContext);
        break;
    }
  } else {
    logger.error(`Unhandled Error: ${error.message}`, logContext);
  }

  // In production, send critical errors to monitoring service
  if (process.env.NODE_ENV === 'production' && error instanceof ApiError && 
      (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH)) {
    // TODO: Implement external error tracking
    // sendToMonitoringService(error, logContext);
  }
}

// Wrapper for async API route handlers with error catching
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ErrorApiResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, {
        handler: handler.name,
        args: args.length
      });
    }
  };
}

// Rate limiting error helper
export function createRateLimitResponse(
  clientIP: string,
  limit: number,
  windowMs: number
): NextResponse<ErrorApiResponse> {
  const error = new RateLimitError(
    `Rate limit exceeded. Maximum ${limit} requests per ${windowMs / 1000} seconds.`,
    { clientIP, limit, windowMs }
  );
  
  return handleApiError(error);
}