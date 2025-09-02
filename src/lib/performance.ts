/**
 * Performance monitoring utilities for DOH Cooperative website
 * ยูทิลิตี้สำหรับการติดตามประสิทธิภาพของเว็บไซต์สหกรณ์ออมทรัพย์กรมทางหลวง
 */

import logger from "@/lib/logger";

// Performance measurement interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// API request timing interface
interface ApiRequestTiming {
  url: string;
  method: string;
  duration: number;
  status: number;
  cached: boolean;
  timestamp: number;
}

/**
 * Performance monitoring class
 * คลาสสำหรับติดตามประสิทธิภาพ
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private apiTimings: ApiRequestTiming[] = [];
  
  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure API request performance
   * วัดประสิทธิภาพการเรียก API
   */
  async measureApiRequest<T>(
    url: string,
    method: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = Date.now();
    
    try {
      const result = await requestFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Check if response was cached (approximate check)
      const cached = duration < 50; // If response is very fast, likely cached
      
      const timing: ApiRequestTiming = {
        url,
        method,
        duration,
        status: 200, // Successful request
        cached,
        timestamp,
      };
      
      this.apiTimings.push(timing);
      this.limitArraySize(this.apiTimings, 100); // Keep last 100 entries
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        const cacheStatus = cached ? '🟢 CACHED' : '🔵 FRESH';
        logger.api(method, url, 200, Math.round(duration));
        logger.debug(`API Performance: ${cacheStatus} ${Math.round(duration)}ms`, { url, method });
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const timing: ApiRequestTiming = {
        url,
        method,
        duration,
        status: 500, // Error status
        cached: false,
        timestamp,
      };
      
      this.apiTimings.push(timing);
      this.limitArraySize(this.apiTimings, 100);
      
      logger.error(`API Request failed: ${method} ${url} (${Math.round(duration)}ms)`, error);
      throw error;
    }
  }

  /**
   * Measure component render time
   * วัดเวลาการ render ของ component
   */
  measureRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    
    renderFn();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.recordMetric({
      name: `render_${componentName}`,
      value: duration,
      timestamp: Date.now(),
      metadata: { component: componentName },
    });
    
    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      logger.warn(`Slow render detected: ${componentName} took ${Math.round(duration)}ms`);
    }
  }

  /**
   * Record a custom performance metric
   * บันทึกค่าประสิทธิภาพแบบกำหนดเอง
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.limitArraySize(this.metrics, 200); // Keep last 200 entries
  }

  /**
   * Get performance summary
   * ดูสรุปประสิทธิภาพ
   */
  getPerformanceSummary() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    
    // Filter recent API timings
    const recentApiTimings = this.apiTimings.filter(timing => timing.timestamp > lastHour);
    
    // Calculate API statistics
    const totalRequests = recentApiTimings.length;
    const cachedRequests = recentApiTimings.filter(timing => timing.cached).length;
    const failedRequests = recentApiTimings.filter(timing => timing.status >= 400).length;
    const avgResponseTime = totalRequests > 0 
      ? recentApiTimings.reduce((sum, timing) => sum + timing.duration, 0) / totalRequests 
      : 0;
    
    // Get cache hit rate
    const cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;
    
    return {
      period: 'Last Hour',
      api: {
        totalRequests,
        cachedRequests,
        failedRequests,
        successRate: totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime),
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      },
      timestamp: now,
    };
  }

  /**
   * Get detailed API timing data
   * ดูข้อมูลเวลาการเรียก API แบบละเอียด
   */
  getApiTimings(limit: number = 20): ApiRequestTiming[] {
    return this.apiTimings
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all stored metrics
   * ล้างข้อมูลประสิทธิภาพทั้งหมด
   */
  clearMetrics(): void {
    this.metrics = [];
    this.apiTimings = [];
  }

  /**
   * Helper method to limit array size
   * วิธีช่วยในการจำกัดขนาดของ array
   */
  private limitArraySize<T>(array: T[], maxSize: number): void {
    if (array.length > maxSize) {
      array.splice(0, array.length - maxSize);
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Enhanced fetch function with performance monitoring
 * ฟังก์ชัน fetch ที่มีการติดตามประสิทธิภาพ
 */
export async function monitoredFetch(
  url: string, 
  options?: RequestInit
): Promise<Response> {
  const method = options?.method || 'GET';
  
  return performanceMonitor.measureApiRequest(url, method, async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  });
}

/**
 * Web Vitals measurement utilities
 * ยูทิลิตี้สำหรับวัด Web Vitals
 */
export const webVitals = {
  /**
   * Measure Largest Contentful Paint (LCP)
   * วัด Largest Contentful Paint
   */
  measureLCP(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
        observer.disconnect();
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 5000);
    });
  },

  /**
   * Measure First Input Delay (FID)
   * วัด First Input Delay
   */
  measureFID(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        const firstEntry = entries[0];
        resolve(firstEntry.processingStart - firstEntry.startTime);
        observer.disconnect();
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      
      // Fallback timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(0);
      }, 10000);
    });
  },

  /**
   * Measure Cumulative Layout Shift (CLS)
   * วัด Cumulative Layout Shift
   */
  measureCLS(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(0);
        return;
      }

      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntry[];
        for (const entry of entries) {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0;
          }
        }
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      
      // Return CLS value after 5 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 5000);
    });
  },
};

/**
 * Performance debugging utilities
 * ยูทิลิตี้สำหรับ debug ประสิทธิภาพ
 */
export const performanceDebug = {
  /**
   * Log performance summary to console
   * แสดงสรุปประสิทธิภาพใน console
   */
  logSummary(): void {
    if (process.env.NODE_ENV === 'development') {
      const summary = performanceMonitor.getPerformanceSummary();
      logger.debug('🚀 Performance Summary', summary.api);
    }
  },

  /**
   * Export performance data as JSON
   * ส่งออกข้อมูลประสิทธิภาพเป็น JSON
   */
  exportData(): string {
    const summary = performanceMonitor.getPerformanceSummary();
    const timings = performanceMonitor.getApiTimings(50);
    
    return JSON.stringify({
      summary,
      recentTimings: timings,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },
};

export default performanceMonitor;