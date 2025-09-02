/**
 * API Security Headers Utility
 * Centralized security headers for all API endpoints
 */

export interface ApiSecurityConfig {
  origin?: string;
  methods?: string;
  additionalHeaders?: Record<string, string>;
}

/**
 * Base security headers for all APIs
 */
export function getBaseSecurityHeaders(config: ApiSecurityConfig = {}): Record<string, string> {
  const {
    origin = process.env.NEXT_PUBLIC_PICHER_BASE_URL || 'https://www.dohsaving.com',
    methods = 'GET, POST, OPTIONS',
    additionalHeaders = {}
  } = config;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'false',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    ...additionalHeaders,
  };
}

/**
 * Security headers for GET APIs (data endpoints)
 */
export function getDataApiSecurityHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return getBaseSecurityHeaders({
    methods: 'GET, OPTIONS',
    additionalHeaders
  });
}

/**
 * Security headers for POST APIs (submission endpoints)
 */
export function getSubmissionApiSecurityHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return getBaseSecurityHeaders({
    methods: 'POST, OPTIONS',
    additionalHeaders
  });
}

/**
 * Security headers for file serving APIs
 */
export function getFileApiSecurityHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return getBaseSecurityHeaders({
    methods: 'GET, OPTIONS',
    additionalHeaders: {
      'Cache-Control': 'public, max-age=86400', // Default cache for files
      ...additionalHeaders
    }
  });
}

/**
 * CORS preflight response headers
 */
export function getCorsPreflightHeaders(methods: string = 'GET, POST, OPTIONS'): Record<string, string> {
  return {
    ...getBaseSecurityHeaders({ methods }),
    'Access-Control-Max-Age': '86400',
  };
}