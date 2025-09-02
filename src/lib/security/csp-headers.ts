/**
 * Content Security Policy (CSP) Headers Management
 * จัดการ CSP headers เพื่อป้องกัน XSS และ injection attacks
 */

import logger from "@/lib/logger";

// CSP Violation Report interface
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

// CSP Directive Types
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

// Security Header Configuration
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

// Default CSP Configuration for Co-op Website
const DEFAULT_CSP_CONFIG: CSPDirectives = {
  'default-src': ["'self'"],
  
  // Scripts - อนุญาตเฉพาะแหล่งที่เชื่อถือได้
  'script-src': [
    "'self'",
    "'unsafe-inline'", // สำหรับ Next.js inline scripts (ควรลดใช้ในอนาคต)
    "'unsafe-eval'", // สำหรับ development mode (ควรปิดใน production)
    'https://www.googletagmanager.com', // Google Analytics
    'https://www.google-analytics.com',
    'https://connect.facebook.net', // Facebook SDK
    'https://apis.google.com', // Google APIs
    'https://cdn.jsdelivr.net', // CDN libraries
    'https://unpkg.com' // Package CDN
  ],
  
  // Styles - CSS sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // สำหรับ styled-components และ Emotion
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ],
  
  // Images - รูปภาพ
  'img-src': [
    "'self'",
    'data:', // สำหรับ base64 images
    'blob:', // สำหรับ generated images
    'https:', // อนุญาต HTTPS images ทั้งหมด
    'https://www.google-analytics.com',
    'https://www.facebook.com',
    'https://scontent.fbkk1-1.fna.fbcdn.net' // Facebook images
  ],
  
  // Fonts
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net'
  ],
  
  // AJAX/XHR connections
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://analytics.google.com',
    'wss://localhost:*', // WebSocket for dev
    'https://api.dohsaving.com', // API endpoint
    'https://vitals.vercel-insights.com' // Performance monitoring
  ],
  
  // Media files
  'media-src': [
    "'self'",
    'data:',
    'blob:',
    'https:'
  ],
  
  // Objects and embeds
  'object-src': ["'none'"], // ป้องกัน Flash และ plugin เก่า
  
  // Frames/iframes
  'frame-src': [
    "'self'",
    'https://www.youtube.com', // YouTube embeds
    'https://www.facebook.com', // Facebook embeds
    'https://www.google.com' // Google Maps/Forms
  ],
  
  // Web Workers
  'worker-src': [
    "'self'",
    'blob:'
  ],
  
  // Child contexts
  'child-src': [
    "'self'",
    'blob:'
  ],
  
  // Form submissions
  'form-action': [
    "'self'"
  ],
  
  // Frame ancestors (clickjacking protection)
  'frame-ancestors': ["'none'"],
  
  // Base URI
  'base-uri': ["'self'"],
  
  // Upgrade insecure requests
  'upgrade-insecure-requests': true,
  
  // Block mixed content
  'block-all-mixed-content': true,
  
  // Trusted Types (modern browsers)
  'require-trusted-types-for': ["'script'"],
  'trusted-types': ['nextjs', 'react', 'default'],
  
  // Reporting
  'report-uri': ['/api/security/csp-report'],
  'report-to': ['csp-endpoint']
};

// Environment-specific CSP configurations
const CSP_CONFIGS = {
  development: {
    ...DEFAULT_CSP_CONFIG,
    'script-src': [
      ...DEFAULT_CSP_CONFIG['script-src']!,
      "'unsafe-eval'", // สำหรับ HMR
      'webpack://*' // Webpack dev server
    ],
    'connect-src': [
      ...DEFAULT_CSP_CONFIG['connect-src']!,
      'ws://localhost:*',
      'wss://localhost:*',
      'http://localhost:*'
    ]
  },
  
  production: {
    ...DEFAULT_CSP_CONFIG,
    'script-src': DEFAULT_CSP_CONFIG['script-src']!.filter(src => src !== "'unsafe-eval'"),
    'upgrade-insecure-requests': true,
    'block-all-mixed-content': true
  },
  
  strict: {
    ...DEFAULT_CSP_CONFIG,
    'script-src': ["'self'"], // ไม่อนุญาต inline scripts
    'style-src': ["'self'"], // ไม่อนุญาต inline styles
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'frame-ancestors': ["'none'"]
  }
};

// CSP Header Builder
export class CSPHeaderBuilder {
  private directives: CSPDirectives;
  
  constructor(config?: CSPDirectives) {
    const env = process.env.NODE_ENV || 'development';
    this.directives = config || CSP_CONFIGS[env as keyof typeof CSP_CONFIGS] || DEFAULT_CSP_CONFIG;
  }

  /**
   * เพิ่ม directive ใหม่หรืออัปเดตที่มีอยู่
   */
  addDirective(directive: keyof CSPDirectives, values: string | string[] | boolean): this {
    if (typeof values === 'boolean') {
      // For boolean directives like 'upgrade-insecure-requests'
      (this.directives as Record<string, unknown>)[directive] = values;
    } else {
      // For string array directives
      const existingValues = (this.directives[directive] as string[]) || [];
      const newValues = Array.isArray(values) ? values : [values];
      (this.directives as Record<string, unknown>)[directive] = [...existingValues, ...newValues];
    }
    return this;
  }

  /**
   * ลบ directive
   */
  removeDirective(directive: keyof CSPDirectives): this {
    delete this.directives[directive];
    return this;
  }

  /**
   * สร้าง CSP header string
   */
  build(): string {
    const parts: string[] = [];

    for (const [directive, value] of Object.entries(this.directives)) {
      if (value === true) {
        parts.push(directive);
      } else if (Array.isArray(value) && value.length > 0) {
        parts.push(`${directive} ${value.join(' ')}`);
      } else if (typeof value === 'string') {
        parts.push(`${directive} ${value}`);
      }
    }

    return parts.join('; ');
  }

  /**
   * สร้าง report-only CSP header
   */
  buildReportOnly(): string {
    return this.build();
  }
}

// Security Headers Manager
export class SecurityHeadersManager {
  private config: SecurityHeadersConfig;

  constructor(config?: SecurityHeadersConfig) {
    this.config = config || this.getDefaultConfig();
  }

  private getDefaultConfig(): SecurityHeadersConfig {
    const env = process.env.NODE_ENV || 'development';
    
    return {
      csp: CSP_CONFIGS[env as keyof typeof CSP_CONFIGS] || DEFAULT_CSP_CONFIG,
      
      // HSTS (HTTP Strict Transport Security)
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      
      // X-Frame-Options
      xFrameOptions: 'DENY',
      
      // X-Content-Type-Options
      xContentTypeOptions: 'nosniff',
      
      // Referrer Policy
      referrerPolicy: 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      permissionsPolicy: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
        payment: ["'self'"],
        usb: ["'none'"],
        interest_cohort: ["'none'"] // Privacy protection
      },
      
      // Cross-Origin Policies
      crossOriginEmbedderPolicy: 'unsafe-none', // ปรับเป็น 'require-corp' สำหรับความปลอดภัยสูง
      crossOriginOpenerPolicy: 'same-origin-allow-popups',
      crossOriginResourcePolicy: 'same-site'
    };
  }

  /**
   * สร้าง security headers object
   */
  generateHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Content Security Policy
    if (this.config.csp) {
      const cspBuilder = new CSPHeaderBuilder(this.config.csp);
      headers['Content-Security-Policy'] = cspBuilder.build();
      
      // Add report-only version for testing
      if (process.env.NODE_ENV === 'development') {
        headers['Content-Security-Policy-Report-Only'] = cspBuilder.buildReportOnly();
      }
    }

    // HSTS
    if (this.config.hsts && process.env.NODE_ENV === 'production') {
      let hstsValue = `max-age=${this.config.hsts.maxAge}`;
      if (this.config.hsts.includeSubDomains) hstsValue += '; includeSubDomains';
      if (this.config.hsts.preload) hstsValue += '; preload';
      headers['Strict-Transport-Security'] = hstsValue;
    }

    // X-Frame-Options
    if (this.config.xFrameOptions) {
      headers['X-Frame-Options'] = this.config.xFrameOptions;
    }

    // X-Content-Type-Options
    if (this.config.xContentTypeOptions) {
      headers['X-Content-Type-Options'] = this.config.xContentTypeOptions;
    }

    // Referrer Policy
    if (this.config.referrerPolicy) {
      headers['Referrer-Policy'] = this.config.referrerPolicy;
    }

    // Permissions Policy
    if (this.config.permissionsPolicy) {
      const permissionsParts = Object.entries(this.config.permissionsPolicy)
        .map(([directive, allowlist]) => `${directive}=(${allowlist.join(' ')})`)
        .join(', ');
      headers['Permissions-Policy'] = permissionsParts;
    }

    // Cross-Origin Policies
    if (this.config.crossOriginEmbedderPolicy) {
      headers['Cross-Origin-Embedder-Policy'] = this.config.crossOriginEmbedderPolicy;
    }

    if (this.config.crossOriginOpenerPolicy) {
      headers['Cross-Origin-Opener-Policy'] = this.config.crossOriginOpenerPolicy;
    }

    if (this.config.crossOriginResourcePolicy) {
      headers['Cross-Origin-Resource-Policy'] = this.config.crossOriginResourcePolicy;
    }

    // Additional security headers
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['X-DNS-Prefetch-Control'] = 'off';
    headers['X-Download-Options'] = 'noopen';
    headers['X-Permitted-Cross-Domain-Policies'] = 'none';

    return headers;
  }

  /**
   * Log CSP violations
   */
  static logCSPViolation(report: CSPViolationReport, ip?: string): void {
    logger.security('CSP Violation', {
      ip,
      blockedURI: report['blocked-uri'],
      documentURI: report['document-uri'],
      violatedDirective: report['violated-directive'],
      originalPolicy: report['original-policy'],
      referrer: report.referrer,
      severity: 'medium'
    });
  }
}

// Helper functions
export function getSecurityHeaders(): Record<string, string> {
  const manager = new SecurityHeadersManager();
  return manager.generateHeaders();
}

export function createCSPHeader(directives?: CSPDirectives): string {
  const builder = new CSPHeaderBuilder(directives);
  return builder.build();
}

export default SecurityHeadersManager;