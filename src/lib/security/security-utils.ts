/**
 * Advanced Security Validation Utilities
 * เครื่องมือตรวจสอบความปลอดภัยขั้นสูง
 */

import * as crypto from 'crypto';
import { NextRequest } from 'next/server';
import logger from '@/lib/logger';

// Security threat levels
export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Security scan result
export interface SecurityScanResult {
  isSecure: boolean;
  threatLevel: ThreatLevel;
  threats: string[];
  recommendations: string[];
  score: number; // 0-100
}

// IP reputation data
export interface IPReputation {
  ip: string;
  isMalicious: boolean;
  reputation: 'good' | 'suspicious' | 'bad';
  sources: string[];
  lastSeen?: Date;
  threatTypes?: string[];
}

// Request fingerprint
export interface RequestFingerprint {
  hash: string;
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  connection: string;
  ipHash: string;
  timestamp: number;
}

/**
 * Advanced Security Scanner
 */
export class SecurityScanner {
  private static readonly MALICIOUS_PATTERNS = {
    // Common attack patterns
    SQL_INJECTION: [
      /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
      /\b(exec|execute|sp_executesql)\b/i,
      /\b(xp_cmdshell|sp_oacreate)\b/i,
      /('|\"|;|--|\||&|\*|\+|<|>|=|\(|\))/,
      /\b(or|and)\s+\d+\s*=\s*\d+/i
    ],
    
    XSS_PATTERNS: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi
    ],
    
    COMMAND_INJECTION: [
      /(\||&&|;|`|\$\(|\${|<|>)/,
      /\b(cat|ls|pwd|whoami|id|ps|netstat|wget|curl)\b/i,
      /\b(rm|mv|cp|chmod|chown|sudo)\b/i
    ],
    
    PATH_TRAVERSAL: [
      /(\.\.|\/\.\.|\\\.\.|\%2e\%2e|\%252e\%252e)/i,
      /(\.\.\/)|(\.\.\\)/g,
      /(\/|\\)(etc|var|usr|home|root|boot|sys|proc)(\/|\\)/i
    ],
    
    LDAP_INJECTION: [
      /(\*|\(|\)|\||&|!|=|<|>|~|\/)/,
      /\b(objectClass|cn|uid|sn|mail)\b/i
    ],
    
    XXE_PATTERNS: [
      /<!ENTITY/i,
      /SYSTEM\s+["'][^"']*["']/i,
      /PUBLIC\s+["'][^"']*["']/i
    ],
    
    SSRF_PATTERNS: [
      /file:\/\//i,
      /ftp:\/\//i,
      /gopher:\/\//i,
      /dict:\/\//i,
      /localhost/i,
      /127\.0\.0\.1/,
      /192\.168\./,
      /10\./,
      /172\.(1[6-9]|2[0-9]|3[01])\./
    ]
  };

  /**
   * Scan request for security threats
   */
  static scanRequest(request: NextRequest, body?: string): SecurityScanResult {
    const threats: string[] = [];
    let threatLevel = ThreatLevel.LOW;
    let score = 100;

    // Get all request data to scan
    const scanTargets = [
      request.nextUrl.pathname,
      request.nextUrl.search,
      body || '',
      ...Array.from(request.headers).map(([, value]) => value)
    ];

    // Scan for each threat type
    for (const target of scanTargets) {
      if (!target || typeof target !== 'string') continue;

      // SQL Injection
      for (const pattern of this.MALICIOUS_PATTERNS.SQL_INJECTION) {
        if (pattern.test(target)) {
          threats.push('SQL_INJECTION');
          threatLevel = ThreatLevel.HIGH;
          score -= 30;
          break;
        }
      }

      // XSS
      for (const pattern of this.MALICIOUS_PATTERNS.XSS_PATTERNS) {
        if (pattern.test(target)) {
          threats.push('XSS_ATTACK');
          threatLevel = ThreatLevel.HIGH;
          score -= 25;
          break;
        }
      }

      // Command Injection
      for (const pattern of this.MALICIOUS_PATTERNS.COMMAND_INJECTION) {
        if (pattern.test(target)) {
          threats.push('COMMAND_INJECTION');
          threatLevel = ThreatLevel.CRITICAL;
          score -= 40;
          break;
        }
      }

      // Path Traversal
      for (const pattern of this.MALICIOUS_PATTERNS.PATH_TRAVERSAL) {
        if (pattern.test(target)) {
          threats.push('PATH_TRAVERSAL');
          threatLevel = ThreatLevel.HIGH;
          score -= 35;
          break;
        }
      }

      // LDAP Injection
      for (const pattern of this.MALICIOUS_PATTERNS.LDAP_INJECTION) {
        if (pattern.test(target)) {
          threats.push('LDAP_INJECTION');
          threatLevel = ThreatLevel.MEDIUM;
          score -= 20;
          break;
        }
      }

      // XXE
      for (const pattern of this.MALICIOUS_PATTERNS.XXE_PATTERNS) {
        if (pattern.test(target)) {
          threats.push('XXE_ATTACK');
          threatLevel = ThreatLevel.HIGH;
          score -= 30;
          break;
        }
      }

      // SSRF
      for (const pattern of this.MALICIOUS_PATTERNS.SSRF_PATTERNS) {
        if (pattern.test(target)) {
          threats.push('SSRF_ATTACK');
          threatLevel = ThreatLevel.MEDIUM;
          score -= 20;
          break;
        }
      }
    }

    // Additional checks
    this.checkSuspiciousHeaders(request, threats);
    this.checkRequestSize(request, body, threats);

    score = Math.max(0, score);
    const isSecure = threats.length === 0;

    const recommendations = this.generateRecommendations(threats);

    return {
      isSecure,
      threatLevel,
      threats: Array.from(new Set(threats)), // Remove duplicates
      recommendations,
      score
    };
  }

  /**
   * Check for suspicious headers
   */
  private static checkSuspiciousHeaders(
    request: NextRequest, 
    threats: string[]
  ): void {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';

    // Suspicious user agents
    const suspiciousUA = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /burp/i,
      /owasp/i,
      /scanner/i,
      /crawler/i
    ];

    for (const pattern of suspiciousUA) {
      if (pattern.test(userAgent)) {
        threats.push('SUSPICIOUS_USER_AGENT');
        break;
      }
    }

    // Check for empty or missing user agent
    if (!userAgent || userAgent.length < 10) {
      threats.push('MISSING_USER_AGENT');
    }

    // Check for suspicious referer
    if (referer && this.MALICIOUS_PATTERNS.SSRF_PATTERNS.some(p => p.test(referer))) {
      threats.push('SUSPICIOUS_REFERER');
    }
  }

  /**
   * Check request size limits
   */
  private static checkRequestSize(
    request: NextRequest,
    body: string | undefined,
    threats: string[]
  ): void {
    const contentLength = request.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength, 10) : (body?.length || 0);

    // Check for abnormally large requests
    if (size > 50 * 1024 * 1024) { // 50MB
      threats.push('OVERSIZED_REQUEST');
    }

    // Check for extremely long URLs
    if (request.url.length > 2048) {
      threats.push('OVERSIZED_URL');
    }
  }

  /**
   * Generate security recommendations
   */
  private static generateRecommendations(threats: string[]): string[] {
    const recommendations: string[] = [];

    if (threats.includes('SQL_INJECTION')) {
      recommendations.push('Use parameterized queries and input validation');
    }

    if (threats.includes('XSS_ATTACK')) {
      recommendations.push('Implement proper output encoding and CSP headers');
    }

    if (threats.includes('COMMAND_INJECTION')) {
      recommendations.push('Avoid executing system commands with user input');
    }

    if (threats.includes('PATH_TRAVERSAL')) {
      recommendations.push('Validate and sanitize file paths');
    }

    if (threats.includes('SUSPICIOUS_USER_AGENT')) {
      recommendations.push('Block or monitor suspicious user agents');
    }

    if (threats.includes('OVERSIZED_REQUEST')) {
      recommendations.push('Implement request size limits');
    }

    return recommendations;
  }
}

/**
 * IP Reputation Manager
 */
export class IPReputationManager {
  private static readonly KNOWN_BAD_IPS = new Set<string>([
    // Add known malicious IPs here
  ]);

  private static readonly PRIVATE_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^fc00:/,
    /^fe80:/,
    /^::1$/,
    /^localhost$/i
  ];

  /**
   * Check IP reputation
   */
  static async checkIPReputation(ip: string): Promise<IPReputation> {
    // Check if it's a private IP
    const isPrivate = this.PRIVATE_IP_RANGES.some(range => range.test(ip));
    
    if (isPrivate) {
      return {
        ip,
        isMalicious: false,
        reputation: 'good',
        sources: ['private_ip_check']
      };
    }

    // Check against known bad IPs
    if (this.KNOWN_BAD_IPS.has(ip)) {
      return {
        ip,
        isMalicious: true,
        reputation: 'bad',
        sources: ['internal_blacklist'],
        threatTypes: ['known_malicious']
      };
    }

    // Here you could integrate with external reputation services
    // like AbuseIPDB, VirusTotal, etc.
    
    return {
      ip,
      isMalicious: false,
      reputation: 'good',
      sources: ['default']
    };
  }

  /**
   * Add IP to blacklist
   */
  static blacklistIP(ip: string): void {
    (this.KNOWN_BAD_IPS as Set<string>).add(ip);
    logger.security('IP added to blacklist', {
      ip,
      severity: 'medium'
    });
  }
}

/**
 * Request Fingerprinting
 */
export class RequestFingerprinter {
  /**
   * Generate unique fingerprint for request
   */
  static generateFingerprint(request: NextRequest): RequestFingerprint {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const connection = request.headers.get('connection') || '';
    const ip = this.getClientIP(request);

    // Create hash of combined headers
    const combined = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${connection}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    // Hash IP separately for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    return {
      hash,
      userAgent,
      acceptLanguage,
      acceptEncoding,
      connection,
      ipHash,
      timestamp: Date.now()
    };
  }

  /**
   * Detect potential bot/automation
   */
  static detectBot(fingerprint: RequestFingerprint): boolean {
    const { userAgent, acceptLanguage, acceptEncoding } = fingerprint;

    // Check for common bot indicators
    const botIndicators = [
      !userAgent || userAgent.length < 10,
      !acceptLanguage,
      !acceptEncoding,
      /bot|crawler|spider|scraper/i.test(userAgent),
      /curl|wget|python|java|node/i.test(userAgent)
    ];

    return botIndicators.filter(Boolean).length >= 2;
  }

  private static getClientIP(request: NextRequest): string {
    return request.ip ||
           request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           'unknown';
  }
}

/**
 * Cryptographic utilities
 */
export class CryptoUtils {
  /**
   * Generate cryptographically secure random string
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash sensitive data with salt
   */
  static hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
    const usedSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, usedSalt, 10000, 64, 'sha512').toString('hex');
    
    return { hash, salt: usedSalt };
  }

  /**
   * Verify hashed data
   */
  static verifyHash(data: string, hash: string, salt: string): boolean {
    const computed = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
    return this.constantTimeEquals(computed, hash);
  }

  /**
   * Constant-time string comparison
   */
  private static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string, key: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: { encrypted: string; iv: string }, key: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

/**
 * Security monitoring and alerting
 */
export class SecurityMonitor {
  private static readonly ALERT_THRESHOLDS = {
    HIGH_THREAT_REQUESTS: 5,     // per minute
    FAILED_VALIDATIONS: 10,      // per minute
    SUSPICIOUS_IPS: 3,           // per minute
    BOT_DETECTION: 20            // per minute
  };

  private static counters = new Map<string, { count: number; timestamp: number }>();

  /**
   * Track security event
   */
  static trackEvent(eventType: string, ip: string, details?: unknown): void {
    const key = `${eventType}:${ip}`;
    const now = Date.now();
    const minute = Math.floor(now / 60000);

    const current = this.counters.get(key) || { count: 0, timestamp: minute };
    
    if (current.timestamp !== minute) {
      // Reset counter for new minute
      current.count = 1;
      current.timestamp = minute;
    } else {
      current.count++;
    }

    this.counters.set(key, current);

    // Check thresholds
    this.checkAlertThresholds(eventType, ip, current.count, details);

    // Log the event
    logger.security(`Security event: ${eventType}`, {
      ip,
      count: current.count,
      details,
      severity: this.getSeverityLevel(eventType, current.count)
    });
  }

  /**
   * Check if alert thresholds are exceeded
   */
  private static checkAlertThresholds(
    eventType: string,
    ip: string,
    count: number,
    details?: unknown
  ): void {
    const threshold = this.ALERT_THRESHOLDS[eventType as keyof typeof this.ALERT_THRESHOLDS];
    
    if (threshold && count >= threshold) {
      logger.security(`ALERT: Security threshold exceeded`, {
        eventType,
        ip,
        count,
        threshold,
        details,
        severity: 'critical'
      });

      // Here you could trigger external alerting systems
      // like email, Slack, PagerDuty, etc.
    }
  }

  /**
   * Get severity level based on event type and count
   */
  private static getSeverityLevel(eventType: string, count: number): 'low' | 'medium' | 'high' | 'critical' {
    if (count >= 10) return 'critical';
    if (count >= 5) return 'high';
    if (count >= 3) return 'medium';
    return 'low';
  }

  /**
   * Clean up old counters
   */
  static cleanup(): void {
    const now = Math.floor(Date.now() / 60000);
    
    for (const [key, value] of Array.from(this.counters.entries())) {
      if (now - value.timestamp > 10) { // Keep last 10 minutes
        this.counters.delete(key);
      }
    }
  }
}

// Auto-cleanup every 5 minutes
setInterval(() => {
  SecurityMonitor.cleanup();
}, 5 * 60 * 1000);