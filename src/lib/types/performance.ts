/**
 * Performance Monitoring Type Definitions
 * ประเภทข้อมูลที่เกี่ยวข้องกับการติดตามประสิทธิภาพ
 */

// Performance Metric Base Interface
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// API Request Timing
export interface ApiRequestTiming {
  url: string;
  method: string;
  duration: number;
  status: number;
  cached: boolean;
  timestamp: number;
  size?: {
    request: number;
    response: number;
  };
  phases?: {
    dns?: number;
    tcp?: number;
    tls?: number;
    request?: number;
    firstByte?: number;
    download?: number;
  };
}

// Component Render Performance
export interface ComponentRenderMetric {
  componentName: string;
  renderTime: number;
  updateTime?: number;
  mountTime?: number;
  unmountTime?: number;
  propsCount?: number;
  childrenCount?: number;
  timestamp: number;
}

// Web Vitals Metrics
export interface WebVitalsMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Additional Metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  si?: number; // Speed Index
  tbt?: number; // Total Blocking Time
  
  timestamp: number;
  url: string;
  userAgent?: string;
}

// Database Performance
export interface DatabasePerformanceMetric {
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION';
  duration: number;
  rowsAffected?: number;
  cached: boolean;
  slow: boolean;
  connectionPool?: {
    active: number;
    idle: number;
    total: number;
  };
  timestamp: number;
}

// Memory Usage
export interface MemoryMetric {
  heap: {
    used: number;
    total: number;
    limit: number;
  };
  external: number;
  arrayBuffers: number;
  rss: number; // Resident Set Size
  timestamp: number;
}

// CPU Usage
export interface CPUMetric {
  user: number;
  system: number;
  idle: number;
  usage: number; // percentage
  loadAverage?: number[];
  timestamp: number;
}

// Network Performance
export interface NetworkMetric {
  latency: number;
  throughput: number; // bytes per second
  packetLoss?: number; // percentage
  bandwidth?: number;
  connections: number;
  timestamp: number;
}

// Performance Summary
export interface PerformanceSummary {
  period: string;
  api: {
    totalRequests: number;
    cachedRequests: number;
    failedRequests: number;
    successRate: number;
    avgResponseTime: number;
    cacheHitRate: number;
    slowQueries: number;
  };
  system: {
    avgCPUUsage: number;
    avgMemoryUsage: number;
    peakMemoryUsage: number;
    uptime: number;
  };
  web?: {
    avgLCP: number;
    avgFID: number;
    avgCLS: number;
    performanceScore: number; // 0-100
  };
  timestamp: number;
}

// Performance Alert
export interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  threshold: number;
  actualValue: number;
  message: string;
  timestamp: number;
  acknowledged?: boolean;
  resolvedAt?: number;
}

// Performance Benchmark
export interface PerformanceBenchmark {
  name: string;
  category: 'api' | 'database' | 'render' | 'network' | 'memory';
  baseline: number;
  current: number;
  target: number;
  trend: 'improving' | 'stable' | 'degrading';
  samples: number;
  lastUpdated: number;
}

// Performance Configuration
export interface PerformanceConfig {
  enableMetrics: boolean;
  sampleRate: number; // 0-1
  bufferSize: number;
  flushInterval: number; // milliseconds
  enableWebVitals: boolean;
  enableResourceTiming: boolean;
  slowQueryThreshold: number; // milliseconds
  slowRenderThreshold: number; // milliseconds
  memoryAlertThreshold: number; // percentage
  cpuAlertThreshold: number; // percentage
}

// Performance Observer
export interface PerformanceObserverConfig {
  types: ('navigation' | 'resource' | 'measure' | 'paint' | 'largest-contentful-paint' | 'first-input')[];
  buffered: boolean;
  callback: (entries: PerformanceEntry[]) => void;
}

// Performance Profiler
export interface ProfilerResult {
  function: string;
  duration: number;
  calls: number;
  averageDuration: number;
  percentage: number;
  children?: ProfilerResult[];
}

// Resource Timing
export interface ResourceTiming {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'xhr' | 'fetch' | 'other';
  size: number;
  duration: number;
  cached: boolean;
  timing: {
    dns: number;
    tcp: number;
    request: number;
    response: number;
    domLoading: number;
  };
  timestamp: number;
}

// Performance Budget
export interface PerformanceBudget {
  metrics: {
    [key: string]: {
      budget: number;
      current?: number;
      status: 'pass' | 'warn' | 'fail';
    };
  };
  resources: {
    [resourceType: string]: {
      maxSize: number;
      maxCount: number;
      currentSize?: number;
      currentCount?: number;
    };
  };
  lastCheck: number;
}

// Synthetic Monitoring
export interface SyntheticTest {
  id: string;
  name: string;
  url: string;
  frequency: number; // minutes
  timeout: number; // seconds
  assertions: {
    responseTime: number;
    statusCode: number;
    contentCheck?: string;
  };
  lastRun?: number;
  status: 'pass' | 'fail' | 'timeout';
  history: {
    timestamp: number;
    duration: number;
    status: 'pass' | 'fail';
    error?: string;
  }[];
}