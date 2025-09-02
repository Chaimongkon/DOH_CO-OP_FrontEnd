/**
 * Logging-related Type Definitions
 * ประเภทข้อมูลที่เกี่ยวข้องกับระบบบันทึกข้อมูล
 */

// Base Log Data Interface
export interface LogData {
  [key: string]: unknown;
}

// Error Log Data
export interface ErrorLogData extends LogData {
  error?: Error | string;
  stack?: string;
  code?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  statusCode?: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
}

// Performance Log Data
export interface PerformanceLogData extends LogData {
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

// Security Log Data
export interface SecurityLogData extends LogData {
  ip?: string;
  userAgent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  threatType?: string;
  blocked?: boolean;
}

// API Request Log Data
export interface ApiLogData extends LogData {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  requestSize?: number;
  responseSize?: number;
}

// Business Event Log Data
export interface BusinessLogData extends LogData {
  eventType: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  action?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

// Log Levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// Log Entry Interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: LogData;
  source?: string;
  requestId?: string;
}

// Logger Configuration
export interface LoggerConfig {
  level: LogLevel;
  enabledInProduction: boolean[];
  enableConsole: boolean;
  enableFile: boolean;
  enableExternal: boolean;
  fileConfig?: {
    path: string;
    maxSize: number;
    maxFiles: number;
    rotateDaily: boolean;
  };
  externalConfig?: {
    endpoint: string;
    apiKey: string;
    batchSize: number;
    flushInterval: number;
  };
}

// External Logging Service Configuration
export interface ExternalLogConfig {
  serviceName: 'sentry' | 'datadog' | 'cloudwatch' | 'custom';
  apiKey: string;
  endpoint?: string;
  projectId?: string;
  environment: string;
  release?: string;
}

// Log Query Interface
export interface LogQuery {
  level?: LogLevel;
  startTime?: number;
  endTime?: number;
  source?: string;
  userId?: string;
  requestId?: string;
  message?: string;
  limit?: number;
  offset?: number;
}

// Log Search Result
export interface LogSearchResult {
  entries: LogEntry[];
  total: number;
  hasMore: boolean;
}

// Log Aggregation
export interface LogAggregation {
  timeframe: 'hour' | 'day' | 'week' | 'month';
  groupBy: 'level' | 'source' | 'userId';
  startTime: number;
  endTime: number;
}

export interface LogAggregationResult {
  groups: {
    key: string;
    count: number;
    percentage: number;
  }[];
  total: number;
  timeframe: string;
}