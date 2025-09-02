/**
 * Database Types and Interfaces
 * Centralized database entity definitions
 */

import { RowDataPacket } from "mysql2";

// Base interface for all database rows
export interface BaseRow extends RowDataPacket {
  Id: number;
  CreateDate?: string;
  UpdateDate?: string;
}

// Services table interface
export interface ServicesRow extends BaseRow {
  Subcategories: string;
  ImagePath: string;
  URLLink: string;
  IsActive?: boolean;
  Category?: string;
  Title?: string;
  Description?: string;
  SortOrder?: number;
}

// Complaints table interface
export interface ComplaintsRow extends BaseRow {
  MemberId?: string;
  Name?: string;
  Tel?: string;
  Email?: string;
  Complaint: string;
  Status?: 'pending' | 'processing' | 'resolved' | 'closed';
  CreateDate?: string;
  ResponseDate?: Date;
  Response?: string;
}

// News table interface - standardized across all news APIs
export interface NewsRow extends BaseRow {
  Title: string;
  Details: string;
  ImagePath?: string;
  PdfPath?: string;
  ViewCount?: number;
}

// Photos table interface
export interface PhotosRow extends BaseRow {
  Title: string;
  ImagePath: string;
  ThumbnailPath?: string;
  Description?: string;
  Category?: string;
  AlbumId?: number;
  IsActive: boolean;
  SortOrder?: number;
}

// Questions table interface
export interface QuestionsRow extends BaseRow {
  Name: string;
  MemberNumber: string;
  Title: string;
  Body: string;
  ViewCount: number;
}

// Generic query result wrapper
export interface QueryResult<T extends RowDataPacket> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

// Database operation result
export interface DbOperationResult {
  success: boolean;
  insertId?: number;
  affectedRows?: number;
  message?: string;
  error?: string;
}

// Common database utility types
export type SortOrder = 'ASC' | 'DESC';
export type DatabaseStatus = 'active' | 'inactive' | 'deleted';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface FilterOptions {
  category?: string;
  status?: DatabaseStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

// Common row types used across multiple APIs
export interface CountRow extends RowDataPacket {
  total: number;
}

export interface OrganizationalRow extends BaseRow {
  Name: string;
  Position: string;
  Priority: number;
  Type: string;
  ImagePath: string;
}

export interface SlideRow extends BaseRow {
  No: number;
  ImagePath: string;
  URLLink: string;
}

export interface VideoRow extends BaseRow {
  Title: string;
  Details: string;
  VideoUrl: string;
  ImagePath?: string;
}

export interface DialogRow extends BaseRow {
  Title: string;
  Details: string;
  ImagePath: string;
  IsActive: boolean;
}

export interface FormDownloadRow extends BaseRow {
  Title: string;
  TypeForm: string;
  TypeMember: string;
  FilePath: string;
}

export interface AssetsRow extends BaseRow {
  Year: string;
  Quarter?: string;
  Assets: number;
  Liabilities: number;
  Equity: number;
}

export interface SocietyRow extends BaseRow {
  ImagePath: string;
  SocietyType: string;
  IsActive: boolean;
}

// Candidates table (Elections)
export interface CandidatesRow extends BaseRow {
  Member: string;
  IdCard: string;
  FullName: string;
  Department: string;
  FieldNumber: string;
  SequenceNumber: string;
}

// Security and Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export type ValidationSchema = Record<string, ValidationRule>;

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  type: string;
  threatLevel: ThreatLevel;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
}

export interface CSPViolationReport {
  'blocked-uri'?: string;
  'document-uri'?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'original-policy'?: string;
  referrer?: string;
  'status-code'?: number;
  'script-sample'?: string;
}

export interface SecurityHeadersConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Logging Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ErrorLogData extends LogData {
  error: Error | string;
  stack?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: LogData;
}

// Cache Types
export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

export type CacheProvider = 'memory' | 'redis' | 'database';

// Performance Types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface ApiRequestTiming {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: Date;
}

export interface WebVitalsMetrics {
  CLS: number;
  FID: number;
  LCP: number;
  FCP: number;
  TTFB: number;
}

export interface PerformanceSummary {
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  webVitals: WebVitalsMetrics;
  timestamp: Date;
}

// Additional missing types
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface QueryOptions {
  timeout?: number;
  retries?: number;
  cache?: CacheOptions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface QueryResult<T = any> {
  data: T[];
  rowCount: number;
  affectedRows?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PaginatedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConnectionHealth {
  isConnected: boolean;
  latency?: number;
  lastCheck: Date;
}

export interface DatabaseHealth {
  connections: ConnectionHealth[];
  totalConnections: number;
  activeConnections: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
}