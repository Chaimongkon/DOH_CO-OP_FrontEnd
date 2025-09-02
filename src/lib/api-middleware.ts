/**
 * API Middleware for Error Handling, Rate Limiting, and Request Processing
 * จัดการ middleware สำหรับ API routes ทั้งหมด
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  handleApiError, 
  RateLimitError, 
  ValidationError,
  withErrorHandler 
} from "@/lib/api-errors";
import { RateLimiter, isValidAdminToken } from "@/lib/validation";
import logger from "@/lib/logger";

// Request context interface
export interface ApiRequestContext {
  ip: string;
  userAgent: string;
  method: string;
  url: string;
  startTime: number;
  requestId: string;
}

// Middleware options
export interface MiddlewareOptions {
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  requireAuth?: boolean;
  validateContentType?: string[];
  maxBodySize?: number;
  corsEnabled?: boolean;
}

// Rate limiter instances cache
const rateLimiters = new Map<string, RateLimiter>();

// Get or create rate limiter
function getRateLimiter(key: string, maxRequests: number, windowMs: number): RateLimiter {
  const limiterKey = `${key}:${maxRequests}:${windowMs}`;
  if (!rateLimiters.has(limiterKey)) {
    rateLimiters.set(limiterKey, new RateLimiter(maxRequests, windowMs));
  }
  return rateLimiters.get(limiterKey)!;
}

// Generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract client IP
function extractClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const remoteAddr = request.ip;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  return remoteAddr || 'unknown';
}

// Content-Type validation middleware
export function validateContentType(allowedTypes: string[]) {
  return (request: NextRequest) => {
    const contentType = request.headers.get('content-type');
    if (!contentType) {
      throw new ValidationError('Content-Type header is required');
    }
    
    const isValid = allowedTypes.some(type => contentType.includes(type));
    if (!isValid) {
      throw new ValidationError(
        `Invalid Content-Type. Allowed: ${allowedTypes.join(', ')}`,
        'content-type',
        { receivedType: contentType, allowedTypes }
      );
    }
  };
}

// Body size validation middleware
export function validateBodySize(maxSize: number) {
  return (request: NextRequest) => {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      throw new ValidationError(
        `Request body too large. Maximum size: ${maxSize} bytes`,
        'body-size',
        { size: parseInt(contentLength), maxSize }
      );
    }
  };
}

// Rate limiting middleware
export function applyRateLimit(options: { maxRequests: number; windowMs: number; keyGenerator?: (req: NextRequest) => string }) {
  return (request: NextRequest, context: ApiRequestContext) => {
    const key = options.keyGenerator ? options.keyGenerator(request) : context.ip;
    const limiter = getRateLimiter('api', options.maxRequests, options.windowMs);
    
    if (!limiter.isAllowed(key)) {
      logger.security('Rate limit exceeded', {
        ip: context.ip,
        userAgent: context.userAgent,
        url: context.url,
        method: context.method,
        severity: 'medium'
      });
      
      throw new RateLimitError(
        `Rate limit exceeded. Maximum ${options.maxRequests} requests per ${options.windowMs / 1000} seconds`,
        { 
          ip: context.ip,
          limit: options.maxRequests,
          window: options.windowMs,
          retryAfter: options.windowMs / 1000
        }
      );
    }
  };
}

// CORS middleware
export function applyCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://dohsaving.com',
    'https://www.dohsaving.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  return null;
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add CORS headers if needed
  const origin = response.headers.get('origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}

// Request validation middleware
export function validateRequest(options: MiddlewareOptions) {
  return (request: NextRequest, context: ApiRequestContext) => {
    // Validate Content-Type for POST/PUT requests
    if (options.validateContentType && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      validateContentType(options.validateContentType)(request);
    }
    
    // Validate body size
    if (options.maxBodySize) {
      validateBodySize(options.maxBodySize)(request);
    }
    
    // Apply rate limiting
    if (options.rateLimit) {
      applyRateLimit(options.rateLimit)(request, context);
    }
  };
}

// Handler types
type SimpleHandler = (request: NextRequest, context: ApiRequestContext) => Promise<NextResponse> | NextResponse;
type RouteHandler<T = unknown> = (request: NextRequest, context: ApiRequestContext, params: T) => Promise<NextResponse> | NextResponse;

// Main API middleware wrapper - overloaded signatures
export function withApiMiddleware(
  handler: SimpleHandler,
  options?: MiddlewareOptions
): (request: NextRequest, routeParams?: unknown) => Promise<NextResponse>;

export function withApiMiddleware<T = unknown>(
  handler: RouteHandler<T>,
  options?: MiddlewareOptions
): (request: NextRequest, routeParams?: T) => Promise<NextResponse>;

export function withApiMiddleware(
  handler: SimpleHandler | RouteHandler<unknown>,
  options: MiddlewareOptions = {}
) {
  return withErrorHandler(async (request: NextRequest, routeParams?: unknown): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    // Create request context
    const context: ApiRequestContext = {
      ip: extractClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      method: request.method,
      url: request.url,
      startTime,
      requestId
    };

    // Log incoming request
    logger.api(context.method, context.url, undefined, undefined, {
      requestId,
      ip: context.ip,
      userAgent: context.userAgent
    });

    try {
      // Handle CORS preflight
      if (options.corsEnabled) {
        const corsResponse = applyCORS(request);
        if (corsResponse) {
          return addSecurityHeaders(corsResponse);
        }
      }

      // Apply request validation
      validateRequest(options)(request, context);

      // Execute the actual handler
      const response = routeParams !== undefined 
        ? await (handler as RouteHandler)(request, context, routeParams)
        : await (handler as SimpleHandler)(request, context);
      
      // Calculate response time
      const duration = Date.now() - startTime;
      
      // Log response
      logger.api(
        context.method,
        context.url,
        response.status,
        duration,
        {
          requestId,
          ip: context.ip,
          userAgent: context.userAgent
        }
      );

      // Add security headers and return response
      return addSecurityHeaders(response);

    } catch (error) {
      // Calculate error response time
      const duration = Date.now() - startTime;
      
      // Log error with context
      logger.error(`API Error in ${context.method} ${context.url}`, {
        error: error instanceof Error ? error.message : String(error),
        requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        duration
      });

      // Handle error and return response
      const errorResponse = handleApiError(error, {
        requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        method: context.method,
        url: context.url,
        duration
      });

      return addSecurityHeaders(errorResponse);
    }
  });
}

// Specific middleware presets for common use cases

// Public API (no auth required) with rate limiting - overloaded signatures
export function withPublicApi(
  handler: SimpleHandler
): (request: NextRequest, routeParams?: unknown) => Promise<NextResponse>;

export function withPublicApi<T = unknown>(
  handler: RouteHandler<T>
): (request: NextRequest, routeParams?: T) => Promise<NextResponse>;

export function withPublicApi(
  handler: SimpleHandler | RouteHandler<unknown>
) {
  return withApiMiddleware(handler, {
    rateLimit: { maxRequests: 60, windowMs: 60000 }, // 60 requests per minute for public APIs
    corsEnabled: true,
    validateContentType: ['application/json'],
    maxBodySize: 1024 * 1024 // 1MB
  });
}

// File upload API - overloaded signatures  
export function withFileUploadApi(
  handler: SimpleHandler
): (request: NextRequest, routeParams?: unknown) => Promise<NextResponse>;

export function withFileUploadApi<T = unknown>(
  handler: RouteHandler<T>
): (request: NextRequest, routeParams?: T) => Promise<NextResponse>;

export function withFileUploadApi(
  handler: SimpleHandler | RouteHandler<unknown>
) {
  return withApiMiddleware(handler, {
    rateLimit: { maxRequests: 20, windowMs: 60000 }, // 20 uploads per minute
    corsEnabled: true,
    validateContentType: ['multipart/form-data', 'application/octet-stream'],
    maxBodySize: 10 * 1024 * 1024 // 10MB
  });
}

// High-frequency API (like search, suggestions) - overloaded signatures
export function withHighFrequencyApi(
  handler: SimpleHandler
): (request: NextRequest, routeParams?: unknown) => Promise<NextResponse>;

export function withHighFrequencyApi<T = unknown>(
  handler: RouteHandler<T>
): (request: NextRequest, routeParams?: T) => Promise<NextResponse>;

export function withHighFrequencyApi(
  handler: SimpleHandler | RouteHandler<unknown>
) {
  return withApiMiddleware(handler, {
    rateLimit: { maxRequests: 500, windowMs: 60000 }, // 500 requests per minute
    corsEnabled: true,
    validateContentType: ['application/json'],
    maxBodySize: 512 * 1024 // 512KB
  });
}

// Admin API with authentication validation - overloaded signatures
export function withAuthApi(
  handler: SimpleHandler
): (request: NextRequest, routeParams?: unknown) => Promise<NextResponse>;

export function withAuthApi<T = unknown>(
  handler: RouteHandler<T>
): (request: NextRequest, routeParams?: T) => Promise<NextResponse>;

export function withAuthApi(
  handler: SimpleHandler | RouteHandler<unknown>
) {
  return withApiMiddleware(async (request: NextRequest, context: ApiRequestContext, routeParams?: unknown): Promise<NextResponse> => {
    // Verify admin authentication for protected endpoints
    const authHeader = request.headers.get('authorization');
    if (!isValidAdminToken(authHeader)) {
      logger.security('Unauthorized admin API access attempt', {
        ip: context.ip,
        userAgent: context.userAgent,
        url: context.url,
        method: context.method,
        severity: 'high'
      });
      
      throw new ValidationError('Admin authentication required', 'auth', {
        required: 'Bearer token',
        provided: authHeader ? 'Invalid token' : 'No token'
      });
    }

    // Call the actual handler with authentication context
    return routeParams !== undefined 
      ? await (handler as RouteHandler)(request, context, routeParams)
      : await (handler as SimpleHandler)(request, context);
  }, {
    rateLimit: { maxRequests: 50, windowMs: 60000 }, // Stricter rate limit for admin APIs
    corsEnabled: true,
    requireAuth: true,
    validateContentType: ['application/json'],
    maxBodySize: 2 * 1024 * 1024 // 2MB
  });
}