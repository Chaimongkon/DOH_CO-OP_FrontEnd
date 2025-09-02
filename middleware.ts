// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import logger from "@/lib/logger";
import { EnhancedSecurityMiddleware } from "@/lib/security/enhanced-middleware";
import { getSecurityHeaders } from "@/lib/security/csp-headers";

// Enhanced security middleware instance
const securityMiddleware = new EnhancedSecurityMiddleware({
  enableSecurityScanning: true,
  enableIPReputation: true,
  enableBotDetection: true,
  enableCSPHeaders: true,
  enableAdvancedValidation: true,
  blockSuspiciousRequests: true,
  logSecurityEvents: true,
  maxThreatScore: 70,
  maxRequestsPerIP: 2000, // Per minute - increased for NewsAll and heavy pages
  timeWindowMs: 60000,
  ipWhitelist: [
    '127.0.0.1',
    '::1',
    'localhost'
  ],
  userAgentBlacklist: [
    'sqlmap', 'nmap', 'nikto', 'burp', 'owasp', 'scanner',
    'exploit', 'hack', 'penetration', 'vulnerability'
  ]
});

// Define file route patterns that need API rewriting  
const FILE_ROUTE_PATTERNS = [
  { pattern: /^\/News\/File\/(Image|Pdf)\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/DownloadForm\/File\//, rewriteTo: (path: string) => `/api/${path}` },
  { pattern: /^\/SRD\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/PhotosCover\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/PhotoAll\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/SocietyCoop\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/BusinessReport\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/Slides\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/Organizational\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/Serve\/File\//, rewriteTo: (path: string) => `/api/files${path}` }, // Special case
  { pattern: /^\/Application\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/Particles\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/DialogBoxs\/File\//, rewriteTo: (path: string) => `/api${path}` },
  { pattern: /^\/ElectionDepartment\/File\//, rewriteTo: (path: string) => `/api${path}` },
];

// Get enhanced security headers
const SECURITY_HEADERS = getSecurityHeaders();

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  // Skip security checks for static assets and internal endpoints
  const skipSecurityPaths = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/api/security/csp-report', // Allow CSP reports
    '/api/News', // Skip News API completely
    '/NewsAll'   // Skip NewsAll page completely
  ];

  // Paths with relaxed rate limiting
  const relaxedRateLimitPaths = [
    '/NewsAll',
    '/api/News'
  ];

  const shouldSkipSecurity = skipSecurityPaths.some(path => pathname.startsWith(path));

  // Apply enhanced security checks for non-static requests
  if (!shouldSkipSecurity) {
    try {
      // Check if this is a high-traffic page that needs relaxed limits
      const isRelaxedRateLimitPath = relaxedRateLimitPaths.some(path => pathname.startsWith(path));
      
      // Debug log for NewsAll related requests
      if (pathname.includes('News') || pathname.includes('NewsAll')) {
        // eslint-disable-next-line no-console
        console.log('News-related request:', {
          pathname,
          isRelaxedRateLimitPath,
          relaxedRateLimitPaths,
          ip
        });
      }
      
      // Get request body for POST/PUT/PATCH requests
      let body: string | undefined;
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const clonedReq = req.clone();
          body = await clonedReq.text();
        } catch {
          // Ignore body reading errors for middleware
        }
      }

      // Skip rate limiting for NewsAll and related APIs
      if (isRelaxedRateLimitPath) {
        // eslint-disable-next-line no-console
        console.log('Skipping security middleware for:', pathname);
        // Skip security middleware for paths that need high request volumes
        const response = NextResponse.next();
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // Run security checks for other paths
      const securityResult = await securityMiddleware.checkSecurity(req, body);

      // Block suspicious requests
      if (!securityResult.allow) {
        logger.security('Request blocked by security middleware', {
          ip,
          userAgent,
          pathname,
          reason: securityResult.reason,
          threatLevel: securityResult.threatLevel,
          threats: securityResult.threats,
          severity: 'high'
        });

        return new NextResponse('Access Denied', {
          status: 403,
          headers: {
            ...SECURITY_HEADERS,
            'X-Security-Block-Reason': securityResult.reason || 'Security policy violation'
          }
        });
      }
    } catch (error) {
      // Log security middleware errors but don't block requests
      logger.error('Security middleware error', {
        error: error instanceof Error ? error.message : String(error),
        ip,
        pathname
      });
    }
  }

  // Enhanced directory traversal protection
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%252e%252e')) {
    logger.security('Directory traversal attempt detected', {
      ip,
      userAgent,
      pathname,
      severity: 'high'
    });
    return new NextResponse('Forbidden', { 
      status: 403,
      headers: SECURITY_HEADERS
    });
  }

  // Check for malicious path patterns
  const maliciousPatterns = [
    /\/\.(env|git|svn|htaccess|htpasswd)/i,
    /\/(wp-admin|wp-login|wordpress)/i,
    /\/(admin|administrator|root|test)/i,
    /\.(php|asp|jsp|cgi)$/i,
    /\/etc\/(passwd|shadow|hosts)/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(pathname)) {
      logger.security('Malicious path pattern detected', {
        ip,
        userAgent,
        pathname,
        pattern: pattern.toString(),
        severity: 'high'
      });
      return new NextResponse('Not Found', { 
        status: 404,
        headers: SECURITY_HEADERS
      });
    }
  }

  // Rate limiting for file access
  const isFileRequest = FILE_ROUTE_PATTERNS.some(route => route.pattern.test(pathname));
  if (isFileRequest) {
    logger.info('File access request', {
      ip,
      userAgent,
      pathname,
      timestamp: new Date().toISOString()
    });
  }

  // Apply file route rewriting using dynamic patterns
  for (const route of FILE_ROUTE_PATTERNS) {
    if (route.pattern.test(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = route.rewriteTo(pathname);
      
      logger.info('URL rewrite applied', {
        original: pathname,
        rewritten: url.pathname,
        ip
      });
      
      const response = NextResponse.rewrite(url);
      
      // Add security headers to rewritten responses
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Matcher configuration for file routes and security
export const config = {
  matcher: [
    // File serving routes
    "/News/File/(Image|Pdf)/:path*",
    "/DownloadForm/File/:path*",
    "/SRD/File/:path*",
    "/PhotosCover/File/:path*",
    "/PhotoAll/File/:path*",
    "/SocietyCoop/File/:path*",
    "/BusinessReport/File/:path*",
    "/Slides/File/:path*",
    "/Organizational/File/:path*",
    "/Serve/File/:path*",
    "/Application/File/:path*",
    "/Particles/File/:path*",
    "/DialogBoxs/File/:path*",
    "/ElectionDepartment/File/:path*",
    // Include API routes for security headers
    "/api/:path*",
    // Include main pages for security headers
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};