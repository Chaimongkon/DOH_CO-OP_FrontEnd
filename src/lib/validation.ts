/**
 * Input validation and sanitization utilities
 * For security and data integrity
 */

/**
 * Validates if a URL is safe for API calls
 */
export function isValidApiUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Check against known safe domains (if needed)
    const allowedDomains = [
      'localhost',
      'dohsaving.com',
      'www.dohsaving.com'
    ];
    
    // In development, allow any localhost port
    if (parsedUrl.hostname === 'localhost' && process.env.NODE_ENV === 'development') {
      return true;
    }
    
    return allowedDomains.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

/**
 * Sanitizes HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }
  
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .replace(/\r?\n/g, '<br>');
}

/**
 * Validates environment variables
 */
export function validateEnvironmentVariables() {
  const requiredVars = ['NEXT_PUBLIC_API_BASE_URL'];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
    
    if (varName === 'NEXT_PUBLIC_API_BASE_URL' && !isValidApiUrl(value)) {
      throw new Error(`Invalid API base URL: ${value}`);
    }
  }
}

/**
 * Rate limiting helper for API calls
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests = 100, timeWindowMs = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.timeWindow);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

/**
 * Validates API response structure
 */
export function validateApiResponse(response: unknown): response is { data?: unknown; success?: boolean; message?: string } {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  const res = response as Record<string, unknown>;
  
  // Check for required properties with correct types
  if (res.success !== undefined && typeof res.success !== 'boolean') {
    return false;
  }
  
  if (res.message !== undefined && typeof res.message !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Validates admin authentication token
 */
export function isValidAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  const adminToken = process.env.ADMIN_API_TOKEN;
  
  // In development, allow a default token
  if (process.env.NODE_ENV === 'development' && !adminToken) {
    return token === 'dev-admin-token';
  }
  
  return Boolean(adminToken && token === adminToken);
}

/**
 * Validates file path to prevent path traversal
 */
export function validateFilePath(basePath: string, requestedPath: string[]): string {
  // Remove any empty segments and path traversal attempts
  const cleanPath = requestedPath
    .filter(segment => segment && segment.trim() !== '')
    .filter(segment => !segment.includes('..'))
    .filter(segment => !/[<>"|?*]/.test(segment))  // Allow : for Windows drives
    .join('/');
    
  if (!cleanPath) {
    throw new Error('Invalid file path');
  }
  
  // Use dynamic import for Node.js path module
  const path = eval('require')('path');
  const fullPath = path.join(basePath, cleanPath);
  const resolvedPath = path.resolve(fullPath);
  const resolvedBase = path.resolve(basePath);
  
  // Normalize paths for cross-platform comparison
  const normalizedResolved = path.normalize(resolvedPath).toLowerCase();
  const normalizedBase = path.normalize(resolvedBase).toLowerCase();
  
  if (!normalizedResolved.startsWith(normalizedBase)) {
    throw new Error('Path traversal not allowed');
  }
  
  return resolvedPath;
}