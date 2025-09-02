/**
 * Standard API Response Types
 * เป็นมาตรฐานสำหรับ API responses ทั้งหมด
 */

// Base Response Interface
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  timestamp: string;
  data?: T;
}

// Success Response
export interface SuccessApiResponse<T = unknown> extends BaseApiResponse<T> {
  success: true;
  data: T;
}

// Error Response
export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Paginated Response
export interface PaginatedApiResponse<T = unknown> extends SuccessApiResponse<T[]> {
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Cache Headers
export interface CacheHeaders {
  'Cache-Control'?: string;
  'X-Cache'?: 'HIT' | 'MISS';
  'X-Cache-Time'?: string;
  'X-Data-Type'?: string;
  'X-Complaint-ID'?: string;
  [key: string]: string | undefined;
}

// Common Error Codes with Thai descriptions
export enum ApiErrorCodes {
  // Database Errors - ข้อผิดพลาดฐานข้อมูล
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_TIMEOUT = 'DB_TIMEOUT', 
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  DB_ERROR = 'DB_ERROR',
  DB_CONSTRAINT_ERROR = 'DB_CONSTRAINT_ERROR',
  DB_DUPLICATE_ENTRY = 'DB_DUPLICATE_ENTRY',
  
  // Validation Errors - ข้อผิดพลาดการตรวจสอบข้อมูล
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATA_FORMAT = 'INVALID_DATA_FORMAT',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INVALID_FILE_SIZE = 'INVALID_FILE_SIZE',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  
  // Authentication & Authorization - การยืนยันตัวตนและสิทธิ์
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Rate Limiting - การจำกัดอัตรา
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  IP_BLOCKED = 'IP_BLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // File Operations - การจัดการไฟล์
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_PROCESSING_ERROR = 'FILE_PROCESSING_ERROR',
  STORAGE_FULL = 'STORAGE_FULL',
  
  // Cache Operations - การจัดการแคช
  CACHE_ERROR = 'CACHE_ERROR',
  CACHE_MISS = 'CACHE_MISS',
  CACHE_TIMEOUT = 'CACHE_TIMEOUT',
  
  // Business Logic - ตรรกะทางธุรกิจ
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_LIMIT_EXCEEDED = 'TRANSACTION_LIMIT_EXCEEDED',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
  
  // External Services - บริการภายนอก
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',
  SMS_SERVICE_ERROR = 'SMS_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',
  
  // Configuration Errors - ข้อผิดพลาดการตั้งค่า
  CONFIG_ERROR = 'CONFIG_ERROR',
  FILE_ACCESS_ERROR = 'FILE_ACCESS_ERROR',
  
  // Generic - ทั่วไป
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE'
}

// Standard HTTP Status Codes
export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  PAYLOAD_TOO_LARGE = 413,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// Helper type for API route handlers
export type ApiRouteResponse<T = unknown> = 
  | SuccessApiResponse<T> 
  | ErrorApiResponse 
  | PaginatedApiResponse<T>;