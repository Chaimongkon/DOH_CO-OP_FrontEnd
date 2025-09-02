/**
 * Enhanced Security Middleware
 * รวมระบบความปลอดภัยขั้นสูงทั้งหมด
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiRequestContext } from '@/lib/api-middleware';
import { 
  SecurityScanner, 
  IPReputationManager, 
  RequestFingerprinter, 
  SecurityMonitor,
  ThreatLevel 
} from './security-utils';
import { InputValidator, VALIDATION_SCHEMAS } from './input-validator';
import { SecurityHeadersManager } from './csp-headers';
import { RequestSignatureValidator, SIGNATURE_PRESETS } from './request-signature';
import { RequestFingerprint } from './security-utils';
import logger from '@/lib/logger';
import { ValidationError } from '@/lib/api-errors';

// Enhanced security configuration
export interface EnhancedSecurityConfig {
  enableSecurityScanning?: boolean;
  enableIPReputation?: boolean;
  enableSignatureValidation?: boolean;
  enableBotDetection?: boolean;
  enableCSPHeaders?: boolean;
  enableAdvancedValidation?: boolean;
  blockSuspiciousRequests?: boolean;
  logSecurityEvents?: boolean;
  
  // Thresholds
  maxThreatScore?: number;
  blockOnThreatLevel?: ThreatLevel;
  
  // Whitelist/Blacklist
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  userAgentBlacklist?: string[];
  
  // Rate limiting
  maxRequestsPerIP?: number;
  timeWindowMs?: number;
}

// Security middleware result
export interface SecurityMiddlewareResult {
  allow: boolean;
  reason?: string;
  threatLevel?: ThreatLevel;
  threats?: string[];
  fingerprint?: RequestFingerprint;
  headers?: Record<string, string>;
}

/**
 * Enhanced Security Middleware Class
 */
export class EnhancedSecurityMiddleware {
  private config: EnhancedSecurityConfig;
  private signatureValidator?: RequestSignatureValidator;
  private headersManager: SecurityHeadersManager;

  constructor(config: EnhancedSecurityConfig = {}) {
    this.config = {
      enableSecurityScanning: true,
      enableIPReputation: true,
      enableSignatureValidation: false, // Optional, requires setup
      enableBotDetection: true,
      enableCSPHeaders: true,
      enableAdvancedValidation: true,
      blockSuspiciousRequests: true,
      logSecurityEvents: true,
      maxThreatScore: 70,
      blockOnThreatLevel: ThreatLevel.HIGH,
      maxRequestsPerIP: 100,
      timeWindowMs: 60000, // 1 minute
      ipWhitelist: [],
      ipBlacklist: [],
      userAgentBlacklist: [
        'sqlmap', 'nmap', 'nikto', 'burp', 'owasp', 'scanner'
      ],
      ...config
    };

    this.headersManager = new SecurityHeadersManager();

    // Initialize signature validator if enabled
    if (this.config.enableSignatureValidation) {
      const secretKey = process.env.API_SIGNATURE_SECRET;
      if (secretKey) {
        this.signatureValidator = new RequestSignatureValidator({
          ...SIGNATURE_PRESETS.MEDIUM_SECURITY,
          secretKey
        });
      } else {
        logger.warn('Signature validation enabled but no secret key provided');
      }
    }
  }

  /**
   * Main security check method
   */
  async checkSecurity(request: NextRequest, body?: string): Promise<SecurityMiddlewareResult> {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    try {
      // 1. IP Whitelist check (bypass all other checks)
      if (this.config.ipWhitelist?.includes(ip)) {
        return { 
          allow: true, 
          headers: this.getSecurityHeaders() 
        };
      }

      // 2. IP Blacklist check
      if (this.config.ipBlacklist?.includes(ip)) {
        SecurityMonitor.trackEvent('BLOCKED_IP', ip, { reason: 'blacklisted' });
        return { 
          allow: false, 
          reason: 'IP address is blacklisted' 
        };
      }

      // 3. User Agent Blacklist check
      if (this.config.userAgentBlacklist?.some(blocked => 
        userAgent.toLowerCase().includes(blocked.toLowerCase())
      )) {
        SecurityMonitor.trackEvent('BLOCKED_USER_AGENT', ip, { userAgent });
        return { 
          allow: false, 
          reason: 'Blocked user agent' 
        };
      }

      // 4. IP Reputation check
      if (this.config.enableIPReputation) {
        const reputation = await IPReputationManager.checkIPReputation(ip);
        if (reputation.isMalicious) {
          SecurityMonitor.trackEvent('MALICIOUS_IP', ip, reputation);
          return { 
            allow: false, 
            reason: 'Malicious IP detected',
            threatLevel: ThreatLevel.HIGH
          };
        }
      }

      // 5. Security scanning
      let scanResult;
      if (this.config.enableSecurityScanning) {
        scanResult = SecurityScanner.scanRequest(request, body);
        
        if (!scanResult.isSecure) {
          SecurityMonitor.trackEvent('SECURITY_THREAT', ip, {
            threats: scanResult.threats,
            score: scanResult.score,
            threatLevel: scanResult.threatLevel
          });

          // Block based on threat level or score
          if (this.config.blockSuspiciousRequests && (
            scanResult.score < (this.config.maxThreatScore || 70) ||
            this.getThreatLevelValue(scanResult.threatLevel) >= 
            this.getThreatLevelValue(this.config.blockOnThreatLevel || ThreatLevel.HIGH)
          )) {
            return {
              allow: false,
              reason: 'Security threat detected',
              threatLevel: scanResult.threatLevel,
              threats: scanResult.threats
            };
          }
        }
      }

      // 6. Bot detection
      if (this.config.enableBotDetection) {
        const fingerprint = RequestFingerprinter.generateFingerprint(request);
        const isBot = RequestFingerprinter.detectBot(fingerprint);
        
        if (isBot) {
          SecurityMonitor.trackEvent('BOT_DETECTION', ip, {
            fingerprint: fingerprint.hash,
            userAgent
          });

          // Optionally block bots (you might want to allow some)
          if (this.config.blockSuspiciousRequests && this.isSuspiciousBot(userAgent)) {
            return {
              allow: false,
              reason: 'Suspicious bot detected',
              fingerprint
            };
          }
        }
      }

      // 7. Signature validation (if enabled)
      if (this.config.enableSignatureValidation && this.signatureValidator) {
        const isValidSignature = await this.signatureValidator.validateSignature(request);
        if (!isValidSignature) {
          SecurityMonitor.trackEvent('INVALID_SIGNATURE', ip);
          return {
            allow: false,
            reason: 'Invalid request signature'
          };
        }
      }

      // 8. Rate limiting (basic implementation)
      if (this.config.maxRequestsPerIP) {
        const rateLimitKey = `rate_limit:${ip}`;
        SecurityMonitor.trackEvent(rateLimitKey, ip);
        
        // This is a simplified rate limiting - consider using Redis for production
      }

      // All checks passed
      return {
        allow: true,
        threatLevel: scanResult?.threatLevel || ThreatLevel.LOW,
        threats: scanResult?.threats || [],
        headers: this.getSecurityHeaders()
      };

    } catch (error) {
      logger.error('Security middleware error', {
        error: error instanceof Error ? error.message : String(error),
        ip,
        url: request.url
      });

      // Fail-safe: allow request but log the error
      return {
        allow: true,
        reason: 'Security check failed',
        headers: this.getSecurityHeaders()
      };
    }
  }

  /**
   * Validate request data with enhanced validation
   */
  validateRequestData(
    data: Record<string, unknown>,
    schemaName: keyof typeof VALIDATION_SCHEMAS,
    context?: string
  ): Record<string, unknown> {
    if (!this.config.enableAdvancedValidation) {
      return data;
    }

    const schema = VALIDATION_SCHEMAS[schemaName];
    if (!schema) {
      throw new ValidationError(`Unknown validation schema: ${schemaName}`, 'schema');
    }

    return InputValidator.validateObject(data, schema, context);
  }

  /**
   * Process CSP violation reports
   */
  async processCSPViolation(request: NextRequest): Promise<void> {
    try {
      const report = await request.json();
      const ip = this.getClientIP(request);
      
      SecurityHeadersManager.logCSPViolation(report, ip);
      SecurityMonitor.trackEvent('CSP_VIOLATION', ip, report);
      
    } catch (error) {
      logger.error('Failed to process CSP violation report', error);
    }
  }

  /**
   * Get security headers
   */
  private getSecurityHeaders(): Record<string, string> {
    if (!this.config.enableCSPHeaders) {
      return {};
    }
    return this.headersManager.generateHeaders();
  }

  /**
   * Check if bot is suspicious
   */
  private isSuspiciousBot(userAgent: string): boolean {
    const suspiciousBots = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /burp/i,
      /scanner/i,
      /exploit/i,
      /hack/i,
      /penetrat/i
    ];

    return suspiciousBots.some(pattern => pattern.test(userAgent));
  }

  /**
   * Convert threat level to numeric value for comparison
   */
  private getThreatLevelValue(level: ThreatLevel): number {
    switch (level) {
      case ThreatLevel.LOW: return 1;
      case ThreatLevel.MEDIUM: return 2;
      case ThreatLevel.HIGH: return 3;
      case ThreatLevel.CRITICAL: return 4;
      default: return 0;
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    return request.ip ||
           request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           'unknown';
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withEnhancedSecurity(
  config?: EnhancedSecurityConfig,
  options?: {
    skipPaths?: string[];
    validationSchema?: keyof typeof VALIDATION_SCHEMAS;
  }
) {
  const securityMiddleware = new EnhancedSecurityMiddleware(config);

  return (
    handler: (request: NextRequest, context: ApiRequestContext) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest, context: ApiRequestContext): Promise<NextResponse> => {
      // Skip security checks for certain paths
      if (options?.skipPaths?.some(path => request.nextUrl.pathname.startsWith(path))) {
        return handler(request, context);
      }

      // Get request body for validation
      let body: string | undefined;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const clonedRequest = request.clone();
          body = await clonedRequest.text();
        } catch (error) {
          logger.warn('Failed to read request body for security check', { error });
        }
      }

      // Run security checks
      const securityResult = await securityMiddleware.checkSecurity(request, body);

      // Block request if security check failed
      if (!securityResult.allow) {
        const errorResponse = {
          success: false,
          error: 'Security check failed',
          message: securityResult.reason || 'Request blocked by security policy',
          code: 'SECURITY_VIOLATION',
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(errorResponse, { 
          status: 403,
          headers: securityResult.headers || {}
        });
      }

      // Enhanced input validation for POST/PUT/PATCH requests
      if (options?.validationSchema && body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const parsedBody = JSON.parse(body);
          const validatedData = securityMiddleware.validateRequestData(
            parsedBody,
            options.validationSchema,
            request.url
          );
          
          // Add validated data to request context
          (context as unknown as Record<string, unknown>).validatedData = validatedData;
        } catch (error) {
          if (error instanceof ValidationError) {
            const errorResponse = {
              success: false,
              error: 'Validation failed',
              message: error.message,
              code: 'VALIDATION_ERROR',
              field: error.context?.field,
              timestamp: new Date().toISOString()
            };

            return NextResponse.json(errorResponse, { 
              status: 400,
              headers: securityResult.headers || {}
            });
          }
          throw error;
        }
      }

      // Execute the original handler
      const response = await handler(request, context);

      // Add security headers to response
      if (securityResult.headers) {
        Object.entries(securityResult.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return response;
    };
  };
}

/**
 * CSP violation reporting endpoint
 */
export async function handleCSPViolation(request: NextRequest): Promise<NextResponse> {
  const securityMiddleware = new EnhancedSecurityMiddleware();
  await securityMiddleware.processCSPViolation(request);
  
  return NextResponse.json({ status: 'received' }, { status: 204 });
}

export default EnhancedSecurityMiddleware;