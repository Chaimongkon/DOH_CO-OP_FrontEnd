/**
 * Request Signature Validation System
 * ระบบตรวจสอบลายเซ็นของ request เพื่อป้องกันการปลอมแปลง
 */

import { NextRequest } from 'next/server';
import logger from '@/lib/logger';

// Dynamic crypto import for server-side only - currently unused but available for future use
// const getCrypto = async () => {
//   if (typeof window !== 'undefined') {
//     throw new Error('Crypto operations not available in browser');
//   }
//   const crypto = await import('crypto');
//   return crypto;
// };

// Signature Configuration
export interface SignatureConfig {
  algorithm: 'hmac-sha256' | 'hmac-sha512' | 'rsa-sha256';
  secretKey: string;
  timestampTolerance: number; // milliseconds
  nonceStore?: NonceStore;
  includeHeaders?: string[];
  includeBody?: boolean;
}

// Nonce Store Interface for preventing replay attacks
export interface NonceStore {
  has(nonce: string): Promise<boolean>;
  add(nonce: string, expiry: number): Promise<void>;
  cleanup(): Promise<void>;
}

// In-memory nonce store (should use Redis in production)
export class MemoryNonceStore implements NonceStore {
  private store = new Map<string, number>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired nonces every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async has(nonce: string): Promise<boolean> {
    const expiry = this.store.get(nonce);
    if (!expiry) return false;
    
    if (Date.now() > expiry) {
      this.store.delete(nonce);
      return false;
    }
    
    return true;
  }

  async add(nonce: string, expiry: number): Promise<void> {
    this.store.set(nonce, expiry);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [nonce, expiry] of Array.from(this.store.entries())) {
      if (now > expiry) {
        this.store.delete(nonce);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Redis nonce store (production ready)
// Redis client interface for type safety
interface RedisClient {
  exists(key: string): Promise<number>;
  setex(key: string, seconds: number, value: string): Promise<string>;
}

export class RedisNonceStore implements NonceStore {
  private redis: RedisClient;

  constructor(redisClient: RedisClient) {
    this.redis = redisClient;
  }

  async has(nonce: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(`nonce:${nonce}`);
      return exists === 1;
    } catch (error) {
      logger.error('Redis nonce check failed', error);
      return false;
    }
  }

  async add(nonce: string, expiry: number): Promise<void> {
    try {
      const ttl = Math.max(1, Math.floor((expiry - Date.now()) / 1000));
      await this.redis.setex(`nonce:${nonce}`, ttl, '1');
    } catch (error) {
      logger.error('Redis nonce add failed', error);
    }
  }

  async cleanup(): Promise<void> {
    // Redis handles TTL automatically
  }
}

// Request Signature Generator and Validator
export class RequestSignatureValidator {
  private config: SignatureConfig;

  constructor(config: SignatureConfig) {
    this.config = {
      includeHeaders: ['user-agent', 'content-type'],
      includeBody: true,
      ...config
    };
  }

  /**
   * Generate signature for a request
   */
  generateSignature(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: string,
    timestamp?: number,
    nonce?: string
  ): {
    signature: string;
    timestamp: number;
    nonce: string;
  } {
    const ts = timestamp || Date.now();
    const requestNonce = nonce || this.generateNonce();

    const stringToSign = this.createStringToSign(method, url, headers, body, ts, requestNonce);
    const signature = this.signString(stringToSign);

    return {
      signature,
      timestamp: ts,
      nonce: requestNonce
    };
  }

  /**
   * Validate request signature
   */
  async validateSignature(request: NextRequest): Promise<boolean> {
    try {
      // Extract signature components from headers
      const signature = request.headers.get('x-signature');
      const timestamp = request.headers.get('x-timestamp');
      const nonce = request.headers.get('x-nonce');

      if (!signature || !timestamp || !nonce) {
        logger.security('Missing signature headers', {
          ip: this.getClientIP(request),
          url: request.url,
          severity: 'medium'
        });
        return false;
      }

      // Validate timestamp
      const requestTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      if (Math.abs(now - requestTime) > this.config.timestampTolerance) {
        logger.security('Request timestamp out of tolerance', {
          ip: this.getClientIP(request),
          requestTime,
          currentTime: now,
          tolerance: this.config.timestampTolerance,
          severity: 'high'
        });
        return false;
      }

      // Check nonce for replay attack prevention
      if (this.config.nonceStore) {
        const nonceExists = await this.config.nonceStore.has(nonce);
        if (nonceExists) {
          logger.security('Nonce replay attack detected', {
            ip: this.getClientIP(request),
            nonce,
            severity: 'high'
          });
          return false;
        }

        // Store nonce
        const expiryTime = requestTime + this.config.timestampTolerance;
        await this.config.nonceStore.add(nonce, expiryTime);
      }

      // Get request body if needed
      let body: string | undefined;
      if (this.config.includeBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          body = await request.text();
        } catch (error) {
          logger.warn('Failed to read request body for signature validation', { error });
          return false;
        }
      }

      // Create headers object
      const headers: Record<string, string> = {};
      if (this.config.includeHeaders) {
        for (const headerName of this.config.includeHeaders) {
          const headerValue = request.headers.get(headerName);
          if (headerValue) {
            headers[headerName.toLowerCase()] = headerValue;
          }
        }
      }

      // Generate expected signature
      const expectedSignature = this.generateSignature(
        request.method,
        request.url,
        headers,
        body,
        requestTime,
        nonce
      );

      // Constant-time comparison to prevent timing attacks
      const isValid = this.constantTimeEquals(signature, expectedSignature.signature);

      if (!isValid) {
        logger.security('Invalid request signature', {
          ip: this.getClientIP(request),
          url: request.url,
          method: request.method,
          expectedSignature: expectedSignature.signature.substring(0, 10) + '...',
          receivedSignature: signature.substring(0, 10) + '...',
          severity: 'high'
        });
      }

      return isValid;

    } catch (error) {
      logger.error('Signature validation error', error);
      return false;
    }
  }

  /**
   * Create string to sign
   */
  private createStringToSign(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: string,
    timestamp?: number,
    nonce?: string
  ): string {
    const parts: string[] = [];

    // Method
    parts.push(method.toUpperCase());

    // URL (without query parameters for consistency)
    const urlObj = new URL(url);
    parts.push(urlObj.pathname);

    // Headers (sorted by key)
    if (this.config.includeHeaders && this.config.includeHeaders.length > 0) {
      const sortedHeaders = Object.keys(headers)
        .sort()
        .map(key => `${key}:${headers[key]}`)
        .join('\n');
      parts.push(sortedHeaders);
    }

    // Body hash
    if (this.config.includeBody && body) {
      if (typeof window !== 'undefined') {
        throw new Error('Body hash generation is not available in browser environment');
      }
      const crypto = eval('require')('crypto');
      const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
      parts.push(bodyHash);
    }

    // Timestamp
    if (timestamp) {
      parts.push(timestamp.toString());
    }

    // Nonce
    if (nonce) {
      parts.push(nonce);
    }

    return parts.join('\n');
  }

  /**
   * Sign string using configured algorithm
   */
  private signString(stringToSign: string): string {
    if (typeof window !== 'undefined') {
      throw new Error('Signature generation is not available in browser environment');
    }

    const crypto = eval('require')('crypto');
    
    switch (this.config.algorithm) {
      case 'hmac-sha256':
        return crypto.createHmac('sha256', this.config.secretKey)
          .update(stringToSign)
          .digest('hex');

      case 'hmac-sha512':
        return crypto.createHmac('sha512', this.config.secretKey)
          .update(stringToSign)
          .digest('hex');

      case 'rsa-sha256':
        return crypto.sign('sha256', new Uint8Array(Buffer.from(stringToSign)), this.config.secretKey)
          .toString('hex');

      default:
        throw new Error(`Unsupported signature algorithm: ${this.config.algorithm}`);
    }
  }

  /**
   * Generate cryptographically secure nonce
   */
  private generateNonce(): string {
    if (typeof window !== 'undefined' && typeof crypto !== 'undefined') {
      // Browser fallback - less secure but functional
      return Array.from(crypto.getRandomValues(new Uint8Array(16)), 
        (byte: number) => byte.toString(16).padStart(2, '0')).join('');
    }
    const cryptoNode = eval('require')('crypto');
    return cryptoNode.randomBytes(16).toString('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
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

// Middleware wrapper for signature validation
export function withSignatureValidation(
  config: SignatureConfig,
  skipPaths?: string[]
) {
  const validator = new RequestSignatureValidator(config);

  return async (request: NextRequest): Promise<boolean> => {
    // Skip validation for certain paths
    if (skipPaths?.some(path => request.nextUrl.pathname.startsWith(path))) {
      return true;
    }

    // Skip for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Validate signature
    const isValid = await validator.validateSignature(request);
    
    if (!isValid) {
      logger.security('Request signature validation failed', {
        ip: validator['getClientIP'](request),
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent') || undefined,
        severity: 'high'
      });
    }

    return isValid;
  };
}

// Client-side signature generation helper
export class ClientSignatureGenerator {
  private config: Pick<SignatureConfig, 'algorithm' | 'secretKey' | 'includeHeaders' | 'includeBody'>;

  constructor(config: Pick<SignatureConfig, 'algorithm' | 'secretKey' | 'includeHeaders' | 'includeBody'>) {
    this.config = config;
  }

  /**
   * Generate signature headers for client requests
   */
  generateHeaders(
    method: string,
    url: string,
    headers: Record<string, string> = {},
    body?: string
  ): Record<string, string> {
    const validator = new RequestSignatureValidator({
      ...this.config,
      timestampTolerance: 0, // Not used for generation
      secretKey: this.config.secretKey
    });

    const signature = validator.generateSignature(method, url, headers, body);

    return {
      'x-signature': signature.signature,
      'x-timestamp': signature.timestamp.toString(),
      'x-nonce': signature.nonce
    };
  }
}

// Configuration presets
export const SIGNATURE_PRESETS = {
  // High security for sensitive operations
  HIGH_SECURITY: {
    algorithm: 'hmac-sha512' as const,
    timestampTolerance: 2 * 60 * 1000, // 2 minutes
    includeHeaders: ['user-agent', 'content-type', 'authorization'],
    includeBody: true
  },

  // Medium security for regular API calls
  MEDIUM_SECURITY: {
    algorithm: 'hmac-sha256' as const,
    timestampTolerance: 5 * 60 * 1000, // 5 minutes
    includeHeaders: ['user-agent', 'content-type'],
    includeBody: true
  },

  // Low security for public read-only operations
  LOW_SECURITY: {
    algorithm: 'hmac-sha256' as const,
    timestampTolerance: 10 * 60 * 1000, // 10 minutes
    includeHeaders: ['user-agent'],
    includeBody: false
  }
};

export default RequestSignatureValidator;