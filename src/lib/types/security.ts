/**
 * Security-related Type Definitions
 * ประเภทข้อมูลที่เกี่ยวข้องกับระบบความปลอดภัย
 */

// Validation Types
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'url' | 'memberid' | 'custom';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => boolean;
  allowedValues?: string[];
  sanitize?: boolean;
  errorMessage?: string;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

// Security Threat Types
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatDetectionResult {
  isSecure: boolean;
  threats: string[];
  score: number; // 0-100
  threatLevel: ThreatLevel;
}

export interface SecurityEvent {
  type: string;
  ip: string;
  userAgent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  data?: Record<string, unknown>;
}

// IP Reputation Types
export interface IPReputationResult {
  ip: string;
  isMalicious: boolean;
  riskScore: number; // 0-100
  sources: string[];
  categories: string[];
  lastSeen?: number;
}

// Request Fingerprinting
export interface RequestFingerprint {
  hash: string;
  ip: string;
  userAgent: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
  dnt?: string;
  connection?: string;
  timestamp: number;
}

// CSP (Content Security Policy) Types
export interface CSPViolationReport {
  'blocked-uri'?: string;
  'document-uri'?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'original-policy'?: string;
  'referrer'?: string;
  'status-code'?: number;
  'script-sample'?: string;
}

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'child-src'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'base-uri'?: string[];
  'upgrade-insecure-requests'?: boolean;
  'block-all-mixed-content'?: boolean;
  'require-trusted-types-for'?: string[];
  'trusted-types'?: string[];
  'report-uri'?: string[];
  'report-to'?: string[];
}

// Security Headers Configuration
export interface SecurityHeadersConfig {
  csp?: CSPDirectives;
  hsts?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  xContentTypeOptions?: 'nosniff';
  referrerPolicy?: 'strict-origin-when-cross-origin' | 'strict-origin' | 'no-referrer' | string;
  permissionsPolicy?: Record<string, string[]>;
  crossOriginEmbedderPolicy?: 'require-corp' | 'unsafe-none';
  crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin';
}

// Request Signature Validation
export interface SignatureConfig {
  algorithm: string;
  secretKey: string;
  headerName: string;
  timestampTolerance: number;
  includeHeaders: string[];
  includeBody: boolean;
}

export interface SignatureValidationResult {
  isValid: boolean;
  reason?: string;
  timestamp?: number;
}

// Enhanced Security Middleware
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

export interface SecurityMiddlewareResult {
  allow: boolean;
  reason?: string;
  threatLevel?: ThreatLevel;
  threats?: string[];
  fingerprint?: RequestFingerprint;
  headers?: Record<string, string>;
}

// OWASP Compliance
export interface ComplianceContext {
  hasAuthentication: boolean;
  usesHTTPS: boolean;
  hasCSRFProtection: boolean;
  hasInputValidation: boolean;
  hasOutputEncoding: boolean;
  hasSecurityHeaders: boolean;
  hasRateLimiting: boolean;
  [key: string]: unknown;
}

export interface ComplianceCheckResult {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  compliance: {
    a1: boolean; // Injection
    a2: boolean; // Broken Authentication
    a3: boolean; // Sensitive Data Exposure
    a4: boolean; // XML External Entities
    a5: boolean; // Broken Access Control
    a6: boolean; // Security Misconfiguration
    a7: boolean; // Cross-Site Scripting
    a8: boolean; // Insecure Deserialization
    a9: boolean; // Using Components with Known Vulnerabilities
    a10: boolean; // Insufficient Logging & Monitoring
  };
}

// File Validation
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileToValidate {
  name: string;
  size: number;
  type: string;
}