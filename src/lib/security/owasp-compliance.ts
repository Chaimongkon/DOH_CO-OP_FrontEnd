/**
 * OWASP Security Compliance Checker
 * ตรวจสอบตามมาตรฐาน OWASP Top 10 และ best practices
 */

import { NextRequest } from 'next/server';

// Context interface for compliance checks
interface ComplianceContext {
  hasAuthentication?: boolean;
  hasAuthorization?: boolean;
  hasLogging?: boolean;
  usesHTTPS?: boolean;
  headers?: Record<string, string>;
}

// OWASP Top 10 2021 categories
export enum OWASPCategory {
  A01_BROKEN_ACCESS_CONTROL = 'A01:2021-Broken Access Control',
  A02_CRYPTOGRAPHIC_FAILURES = 'A02:2021-Cryptographic Failures',
  A03_INJECTION = 'A03:2021-Injection',
  A04_INSECURE_DESIGN = 'A04:2021-Insecure Design',
  A05_SECURITY_MISCONFIGURATION = 'A05:2021-Security Misconfiguration',
  A06_VULNERABLE_COMPONENTS = 'A06:2021-Vulnerable and Outdated Components',
  A07_IDENTIFICATION_FAILURES = 'A07:2021-Identification and Authentication Failures',
  A08_SOFTWARE_INTEGRITY_FAILURES = 'A08:2021-Software and Data Integrity Failures',
  A09_LOGGING_FAILURES = 'A09:2021-Security Logging and Monitoring Failures',
  A10_SSRF = 'A10:2021-Server-Side Request Forgery (SSRF)'
}

// Compliance check result
export interface ComplianceCheckResult {
  category: OWASPCategory;
  passed: boolean;
  score: number; // 0-100
  issues: ComplianceIssue[];
  recommendations: string[];
}

// Individual compliance issue
export interface ComplianceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
  remediation: string;
}

// Overall compliance report
export interface OWASPComplianceReport {
  overallScore: number;
  passedChecks: number;
  totalChecks: number;
  results: ComplianceCheckResult[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  timestamp: string;
}

/**
 * OWASP Compliance Checker
 */
export class OWASPComplianceChecker {
  /**
   * Run complete OWASP compliance check
   */
  static async runComplianceCheck(
    request: NextRequest,
    body?: string,
    context?: ComplianceContext
  ): Promise<OWASPComplianceReport> {
    const results: ComplianceCheckResult[] = [];

    // A01: Broken Access Control
    results.push(await this.checkAccessControl(request, context));

    // A02: Cryptographic Failures
    results.push(await this.checkCryptographicFailures(request, context));

    // A03: Injection
    results.push(await this.checkInjection(request, body));

    // A04: Insecure Design
    results.push(await this.checkInsecureDesign(request, context));

    // A05: Security Misconfiguration
    results.push(await this.checkSecurityMisconfiguration(request, context));

    // A06: Vulnerable Components (static check)
    results.push(await this.checkVulnerableComponents());

    // A07: Identification and Authentication Failures
    results.push(await this.checkAuthenticationFailures(request, context));

    // A08: Software and Data Integrity Failures
    results.push(await this.checkIntegrityFailures(request, context));

    // A09: Security Logging and Monitoring Failures
    results.push(await this.checkLoggingFailures(context));

    // A10: Server-Side Request Forgery
    results.push(await this.checkSSRF(request, body));

    // Calculate overall scores
    const passedChecks = results.filter(r => r.passed).length;
    const totalChecks = results.length;
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    // Count issues by severity
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    results.forEach(result => {
      result.issues.forEach(issue => {
        summary[issue.severity]++;
      });
    });

    return {
      overallScore,
      passedChecks,
      totalChecks,
      results,
      summary,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * A01: Broken Access Control
   */
  private static async checkAccessControl(
    request: NextRequest,
    _context?: ComplianceContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check for authorization headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader && !_context?.hasAuthentication) {
      issues.push({
        severity: 'medium',
        description: 'No authentication mechanism detected',
        remediation: 'Implement proper authentication for protected resources'
      });
      score -= 30;
    }

    // Check for CORS misconfigurations
    const origin = request.headers.get('origin');
    if (origin && origin === '*') {
      issues.push({
        severity: 'high',
        description: 'Wildcard CORS origin detected',
        evidence: 'Access-Control-Allow-Origin: *',
        remediation: 'Use specific origins instead of wildcard'
      });
      score -= 40;
    }

    // Check for insecure direct object references in URL
    const url = request.nextUrl.pathname;
    const suspiciousPatterns = [
      /\/user\/\d+\/admin/i,
      /\/admin\/user\/\d+/i,
      /\/(edit|delete|modify)\/\d+$/i,
      /\/api\/.*\/\d+\/(delete|admin|sensitive)/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        issues.push({
          severity: 'high',
          description: 'Potential insecure direct object reference',
          evidence: url,
          remediation: 'Implement proper authorization checks for object access'
        });
        score -= 35;
        break;
      }
    }

    return {
      category: OWASPCategory.A01_BROKEN_ACCESS_CONTROL,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Implement role-based access control (RBAC)',
        'Use principle of least privilege',
        'Validate user permissions on server-side',
        'Implement proper session management'
      ]
    };
  }

  /**
   * A02: Cryptographic Failures
   */
  private static async checkCryptographicFailures(
    request: NextRequest,
    _context?: ComplianceContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check HTTPS usage
    if (!_context?.usesHTTPS && request.nextUrl.protocol !== 'https:') {
      issues.push({
        severity: 'critical',
        description: 'Application not using HTTPS',
        remediation: 'Force HTTPS for all connections'
      });
      score -= 50;
    }

    // Check for weak encryption indicators in headers
    const headers = request.headers;
    
    // Check for insecure cookies
    const cookieHeader = headers.get('cookie');
    if (cookieHeader) {
      if (!cookieHeader.includes('Secure')) {
        issues.push({
          severity: 'medium',
          description: 'Cookies without Secure flag detected',
          remediation: 'Set Secure flag on all cookies'
        });
        score -= 20;
      }

      if (!cookieHeader.includes('HttpOnly')) {
        issues.push({
          severity: 'medium',
          description: 'Cookies without HttpOnly flag detected',
          remediation: 'Set HttpOnly flag on sensitive cookies'
        });
        score -= 20;
      }
    }

    // Check for weak cipher suites (simplified check)
    const userAgent = headers.get('user-agent') || '';
    if (userAgent.includes('TLS') && userAgent.includes('1.0')) {
      issues.push({
        severity: 'high',
        description: 'Weak TLS version detected',
        evidence: 'TLS 1.0 support',
        remediation: 'Disable TLS 1.0 and 1.1, use TLS 1.2+'
      });
      score -= 30;
    }

    return {
      category: OWASPCategory.A02_CRYPTOGRAPHIC_FAILURES,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Use strong encryption algorithms (AES-256, RSA-2048+)',
        'Implement proper key management',
        'Use HTTPS everywhere',
        'Set secure cookie flags',
        'Disable weak TLS versions'
      ]
    };
  }

  /**
   * A03: Injection
   */
  private static async checkInjection(
    request: NextRequest,
    body?: string
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    const testData = [
      request.nextUrl.search,
      body || '',
      ...Array.from(request.headers).map(([, value]) => value)
    ].filter(Boolean);

    // SQL Injection patterns
    const sqlPatterns = [
      /(\bunion\s+select\b)|(\bselect\s+.*\bunion\b)/i,
      /\b(exec|execute|sp_executesql|xp_cmdshell)\b/i,
      /'([^']*'[^']*'){2,}/i,
      /\b(or|and)\s+\d+\s*=\s*\d+/i,
      /;\s*(drop|delete|insert|update|create)\b/i
    ];

    // NoSQL Injection patterns
    const nosqlPatterns = [
      /\$where/i,
      /\$ne.*null/i,
      /\$regex/i,
      /\$gt.*""/i
    ];

    // Command Injection patterns
    const commandPatterns = [
      /(\||&&|;|`|\$\(|\${)/,
      /\b(cat|ls|pwd|whoami|wget|curl|nc|netcat)\b/i
    ];

    // LDAP Injection patterns
    const ldapPatterns = [
      /\(\*\)/,
      /\(\|\(.*\)\)/,
      /\(&\(.*\)\)/
    ];

    for (const data of testData) {
      if (typeof data !== 'string') continue;
      // Check SQL injection
      for (const pattern of sqlPatterns) {
        if (pattern.test(data)) {
          issues.push({
            severity: 'critical',
            description: 'SQL injection pattern detected',
            evidence: data.substring(0, 100) + '...',
            remediation: 'Use parameterized queries and input validation'
          });
          score -= 40;
          break;
        }
      }

      // Check NoSQL injection
      for (const pattern of nosqlPatterns) {
        if (pattern.test(data)) {
          issues.push({
            severity: 'high',
            description: 'NoSQL injection pattern detected',
            evidence: data.substring(0, 100) + '...',
            remediation: 'Validate and sanitize NoSQL query inputs'
          });
          score -= 35;
          break;
        }
      }

      // Check command injection
      for (const pattern of commandPatterns) {
        if (pattern.test(data)) {
          issues.push({
            severity: 'critical',
            description: 'Command injection pattern detected',
            evidence: data.substring(0, 100) + '...',
            remediation: 'Never execute system commands with user input'
          });
          score -= 45;
          break;
        }
      }

      // Check LDAP injection
      for (const pattern of ldapPatterns) {
        if (pattern.test(data)) {
          issues.push({
            severity: 'high',
            description: 'LDAP injection pattern detected',
            evidence: data.substring(0, 100) + '...',
            remediation: 'Escape LDAP special characters'
          });
          score -= 30;
          break;
        }
      }
    }

    return {
      category: OWASPCategory.A03_INJECTION,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Use parameterized queries/prepared statements',
        'Implement input validation and sanitization',
        'Use safe APIs and escape special characters',
        'Apply principle of least privilege to database accounts',
        'Use allowlists for input validation'
      ]
    };
  }

  /**
   * A04: Insecure Design
   */
  private static async checkInsecureDesign(
    request: NextRequest,
    _context?: ComplianceContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check for missing rate limiting
    const rateLimitHeader = request.headers.get('x-ratelimit-limit');
    if (!rateLimitHeader) {
      issues.push({
        severity: 'medium',
        description: 'No rate limiting detected',
        remediation: 'Implement rate limiting for API endpoints'
      });
      score -= 25;
    }

    // Check for security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'content-security-policy',
      'strict-transport-security'
    ];

    const missingHeaders = securityHeaders.filter(header => 
      !request.headers.get(header)
    );

    if (missingHeaders.length > 0) {
      issues.push({
        severity: 'medium',
        description: `Missing security headers: ${missingHeaders.join(', ')}`,
        remediation: 'Implement all recommended security headers'
      });
      score -= (missingHeaders.length * 5);
    }

    // Check for verbose error messages
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('application/json')) {
      // This would need to be checked in actual error responses
      // For now, we'll assume good practices are followed
    }

    return {
      category: OWASPCategory.A04_INSECURE_DESIGN,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Implement secure design patterns',
        'Use threat modeling',
        'Apply defense in depth',
        'Implement proper error handling',
        'Use secure defaults'
      ]
    };
  }

  /**
   * A05: Security Misconfiguration
   */
  private static async checkSecurityMisconfiguration(
    request: NextRequest,
    _context?: ComplianceContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check server headers for information disclosure
    const serverHeader = _context?.headers?.['server'];
    if (serverHeader && !serverHeader.includes('hidden')) {
      issues.push({
        severity: 'low',
        description: 'Server header reveals technology information',
        evidence: serverHeader,
        remediation: 'Hide or customize server headers'
      });
      score -= 10;
    }

    // Check for debug information in responses
    const debugHeaders = ['x-debug', 'x-trace', 'x-error-detail'];
    for (const header of debugHeaders) {
      if (_context?.headers?.[header]) {
        issues.push({
          severity: 'medium',
          description: 'Debug information exposed in headers',
          evidence: header,
          remediation: 'Remove debug headers in production'
        });
        score -= 20;
      }
    }

    // Check CORS configuration
    const corsHeaders = _context?.headers?.['access-control-allow-origin'];
    if (corsHeaders === '*') {
      issues.push({
        severity: 'high',
        description: 'Overly permissive CORS configuration',
        evidence: 'Access-Control-Allow-Origin: *',
        remediation: 'Use specific origins for CORS'
      });
      score -= 30;
    }

    // Check for default credentials patterns
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const commonDefaults = ['admin:admin', 'admin:password', 'root:root', 'test:test'];
      const base64Auth = authHeader.split(' ')[1];
      if (base64Auth) {
        try {
          const decoded = Buffer.from(base64Auth, 'base64').toString();
          if (commonDefaults.some(cred => decoded.includes(cred))) {
            issues.push({
              severity: 'critical',
              description: 'Default credentials detected',
              remediation: 'Change all default passwords'
            });
            score -= 50;
          }
        } catch {
          // Ignore decode errors
        }
      }
    }

    return {
      category: OWASPCategory.A05_SECURITY_MISCONFIGURATION,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Remove or disable unnecessary features',
        'Keep software up to date',
        'Implement proper configuration management',
        'Use security scanning tools',
        'Follow security hardening guides'
      ]
    };
  }

  /**
   * A06: Vulnerable and Outdated Components
   */
  private static async checkVulnerableComponents(): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // This is a simplified check - in production, you'd integrate with
    // vulnerability databases like npm audit, Snyk, etc.
    
    issues.push({
      severity: 'medium',
      description: 'Manual component vulnerability check required',
      remediation: 'Run npm audit and update vulnerable dependencies'
    });
    score -= 20;

    return {
      category: OWASPCategory.A06_VULNERABLE_COMPONENTS,
      passed: false, // Always requires manual verification
      score,
      issues,
      recommendations: [
        'Regularly update dependencies',
        'Use automated vulnerability scanning',
        'Monitor security advisories',
        'Remove unused dependencies',
        'Use dependency pinning'
      ]
    };
  }

  /**
   * A07: Identification and Authentication Failures
   */
  private static async checkAuthenticationFailures(
    request: NextRequest,
    _context?: ComplianceContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check session management
    const sessionCookie = request.headers.get('cookie');
    if (sessionCookie) {
      // Check for weak session IDs
      const sessionIdMatch = sessionCookie.match(/sessionid=([^;]+)/i);
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        if (sessionId.length < 16) {
          issues.push({
            severity: 'high',
            description: 'Weak session ID detected',
            remediation: 'Use cryptographically strong session IDs'
          });
          score -= 30;
        }
      }
    }

    // Check for password in URL (very bad practice)
    const url = request.nextUrl.href;
    if (/[?&](pass|password|pwd)=/i.test(url)) {
      issues.push({
        severity: 'critical',
        description: 'Password transmitted in URL',
        evidence: 'Password parameter in URL',
        remediation: 'Never send passwords in URLs'
      });
      score -= 50;
    }

    // Check authentication bypass attempts
    const bypassPatterns = [
      /admin=true/i,
      /role=admin/i,
      /isadmin=1/i,
      /auth=bypass/i
    ];

    for (const pattern of bypassPatterns) {
      if (pattern.test(url) || pattern.test(sessionCookie || '')) {
        issues.push({
          severity: 'critical',
          description: 'Authentication bypass attempt detected',
          remediation: 'Implement proper authentication checks'
        });
        score -= 45;
        break;
      }
    }

    return {
      category: OWASPCategory.A07_IDENTIFICATION_FAILURES,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Implement multi-factor authentication',
        'Use strong session management',
        'Implement account lockout policies',
        'Use secure password recovery',
        'Log authentication attempts'
      ]
    };
  }

  /**
   * A08: Software and Data Integrity Failures
   */
  private static async checkIntegrityFailures(
    request: NextRequest,
    _context?: ComplianceContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check for Subresource Integrity
    const cspHeader = _context?.headers?.['content-security-policy'];
    if (cspHeader && !cspHeader.includes('require-sri-for')) {
      issues.push({
        severity: 'medium',
        description: 'Subresource Integrity not enforced',
        remediation: 'Use SRI for external scripts and stylesheets'
      });
      score -= 25;
    }

    // Check for insecure deserialization patterns
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/java-archive') || 
        contentType?.includes('application/x-pickle')) {
      issues.push({
        severity: 'high',
        description: 'Potentially unsafe serialization format',
        evidence: contentType,
        remediation: 'Avoid deserializing untrusted data'
      });
      score -= 35;
    }

    return {
      category: OWASPCategory.A08_SOFTWARE_INTEGRITY_FAILURES,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Use digital signatures for software updates',
        'Implement Subresource Integrity',
        'Validate all inputs',
        'Use secure deserialization',
        'Monitor for unauthorized changes'
      ]
    };
  }

  /**
   * A09: Security Logging and Monitoring Failures
   */
  private static async checkLoggingFailures(_context?: ComplianceContext): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check if logging is enabled
    if (!_context?.hasLogging) {
      issues.push({
        severity: 'high',
        description: 'Security logging not implemented',
        remediation: 'Implement comprehensive security logging'
      });
      score -= 40;
    }

    // This would need integration with actual logging system
    // to check for proper audit trails, retention, etc.

    return {
      category: OWASPCategory.A09_LOGGING_FAILURES,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Log all authentication attempts',
        'Monitor for suspicious patterns',
        'Implement centralized logging',
        'Set up alerting for security events',
        'Ensure log integrity'
      ]
    };
  }

  /**
   * A10: Server-Side Request Forgery
   */
  private static async checkSSRF(
    request: NextRequest,
    body?: string
  ): Promise<ComplianceCheckResult> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    const testData = [
      request.nextUrl.search,
      body || ''
    ].filter(Boolean);

    // SSRF patterns
    const ssrfPatterns = [
      /file:\/\//i,
      /ftp:\/\//i,
      /gopher:\/\//i,
      /dict:\/\//i,
      /localhost/i,
      /127\.0\.0\.1/,
      /192\.168\./,
      /10\./,
      /172\.(1[6-9]|2[0-9]|3[01])\./,
      /@.*:/,  // URL with credentials
      /0x[0-9a-f]+/i, // Hex IP
      /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/
    ];

    for (const data of testData) {
      for (const pattern of ssrfPatterns) {
        if (pattern.test(data)) {
          issues.push({
            severity: 'high',
            description: 'Potential SSRF pattern detected',
            evidence: data.substring(0, 100) + '...',
            remediation: 'Validate and whitelist allowed URLs'
          });
          score -= 35;
          break;
        }
      }
    }

    return {
      category: OWASPCategory.A10_SSRF,
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations: [
        'Validate and sanitize all URLs',
        'Use allowlists for external requests',
        'Implement network segmentation',
        'Disable unnecessary URL schemas',
        'Monitor outbound requests'
      ]
    };
  }
}

export default OWASPComplianceChecker;