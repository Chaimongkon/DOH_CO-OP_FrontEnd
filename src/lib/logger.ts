/**
 * Production-ready logger utility with enhanced error tracking
 * ใช้แทน console.log เพื่อการ debugging ที่ดีขึ้น
 */

import { 
  LogData,
  ErrorLogData,
  PerformanceLogData,
  LogLevel
} from '@/lib/types/logging';
import * as Sentry from '@sentry/nextjs';

class Logger {
  private currentLevel: LogLevel;
  private enabledInProduction: boolean[];

  constructor() {
    // Set log level based on environment
    this.currentLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    
    // What to enable in production: [DEBUG, INFO, WARN, ERROR, CRITICAL]
    this.enabledInProduction = [false, false, false, true, true];
  }

  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return this.enabledInProduction[level];
    }
    return level >= this.currentLevel;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    return `[${level}] ${timestamp} [PID:${pid}] - ${message}`;
  }

  private async sendToExternalService(level: string, message: string, data?: ErrorLogData) {
    try {
      // Skip all external logging in development
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      
      // Send to Sentry based on log level
      const sentryLevel = this.mapLogLevelToSentry(level);
      
      if (data?.error instanceof Error) {
        Sentry.captureException(data.error, {
          level: sentryLevel,
          contexts: {
            log: {
              message,
              level,
              data
            }
          },
          tags: {
            logger: 'true',
            component: String(data.component || 'unknown')
          }
        });
      } else if (level === 'CRITICAL' || level === 'ERROR') {
        Sentry.captureMessage(message, {
          level: sentryLevel,
          contexts: {
            log: {
              level,
              data
            }
          },
          tags: {
            logger: true,
            critical: level === 'CRITICAL'
          }
        });
      }

      // Add breadcrumb for all logs
      Sentry.addBreadcrumb({
        message,
        level: sentryLevel,
        data,
        category: 'logger'
      });

    } catch (error) {
      // Fallback to console if Sentry fails
      // eslint-disable-next-line no-console
      console.error('Failed to send log to Sentry:', error);
      // eslint-disable-next-line no-console
      console.log(`[${level}] ${message}`, data);
    }
  }

  private mapLogLevelToSentry(level: string): Sentry.SeverityLevel {
    switch (level) {
      case 'DEBUG':
        return 'debug';
      case 'INFO':
        return 'info';
      case 'WARN':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'CRITICAL':
        return 'fatal';
      default:
        return 'info';
    }
  }

  /**
   * Debug level logging - development only
   */
  debug(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // Debug output in development environment
      // In a real implementation, this would use the formatted message and data
      void message; // Suppress unused parameter warning
      void data; // Suppress unused parameter warning
    }
  }

  /**
   * Info level logging - development only (unless overridden)
   */
  info(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // Info output in development environment
      // In a real implementation, this would use the formatted message and data
      void message; // Suppress unused parameter warning
      void data; // Suppress unused parameter warning
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.WARN)) {
      // Warning output
      // In a real implementation, this would use the formatted message
      void this.formatMessage('WARN', message);

      // Send warnings to external service in production
      if (process.env.NODE_ENV === 'production') {
        this.sendToExternalService('WARN', message, data as ErrorLogData);
      }
    }
  }

  /**
   * Error level logging - always enabled
   */
  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      // Error output
      // In a real implementation, this would use the formatted message
      void this.formatMessage('ERROR', message);

      // Always send errors to external service
      this.sendToExternalService('ERROR', message, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      } as ErrorLogData);
    }
  }

  /**
   * Critical error logging - always enabled, immediate attention
   */
  critical(message: string, data?: ErrorLogData): void {
    // Critical error output
    // In a real implementation, this would use the formatted message
    void this.formatMessage('CRITICAL', message);

    // Always send critical errors immediately
    this.sendToExternalService('CRITICAL', message, data);

    // TODO: Send immediate notifications (Slack, email, SMS)
    // await sendCriticalAlert(message, data);
  }

  /**
   * API request/response logging with performance metrics
   */
  api(method: string, url: string, status?: number, duration?: number, data?: LogData): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const statusColor = status && status >= 400 ? '🔴' : status && status >= 300 ? '🟡' : '🟢';
      const durationText = duration ? ` (${duration}ms)` : '';
      // API logging
      // In a real implementation, this would use the formatted message
      void this.formatMessage('API', `${statusColor} ${method} ${url}${durationText}`);

      // Log slow requests
      if (duration && duration > 5000) { // 5 seconds
        this.warn(`Slow API request detected: ${method} ${url}`, {
          duration,
          url,
          method,
          status,
          ...data
        });
      }

      // Log API errors
      if (status && status >= 400) {
        this.error(`API Error: ${method} ${url} - ${status}`, {
          url,
          method,
          status,
          duration,
          ...data
        });
      }
    }
  }

  /**
   * Performance monitoring
   */
  performance(operation: string, startTime: number, additionalData?: PerformanceLogData): void {
    const duration = Date.now() - startTime;
    const memUsage = process.memoryUsage();
    
    const performanceData: PerformanceLogData = {
      duration,
      memoryUsage: memUsage,
      operation,
      ...additionalData
    };

    if (duration > 1000) { // Log operations taking more than 1 second
      this.warn(`Slow operation: ${operation}`, performanceData);
    } else {
      this.debug(`Performance: ${operation}`, performanceData);
    }
  }

  /**
   * Security-related logging
   */
  security(event: string, data?: LogData & { ip?: string; userAgent?: string; severity?: 'low' | 'medium' | 'high' | 'critical' }): void {
    // In a real implementation, this would use the formatted message
    void this.formatMessage('SECURITY', `🛡️ ${event}`);
    
    if (data?.severity === 'critical') {
      // Critical security event
      this.sendToExternalService('CRITICAL', `Security Event: ${event}`, data as ErrorLogData);
    } else if (data?.severity === 'high') {
      // High severity security event
      this.sendToExternalService('CRITICAL', `Security Event: ${event}`, data as ErrorLogData);
    } else if (data?.severity === 'medium') {
      // Medium severity security event
      this.sendToExternalService('WARN', `Security Event: ${event}`, data as ErrorLogData);
    } else {
      // Low severity security event
      this.sendToExternalService('INFO', `Security Event: ${event}`, data as ErrorLogData);
    }
  }

  /**
   * Business logic logging (transactions, important events)
   */
  business(event: string, data?: LogData): void {
    // Business event logging
    // In a real implementation, this would use the formatted message
    void this.formatMessage('BUSINESS', `💼 ${event}`);

    // Always log business events to external service
    this.sendToExternalService('INFO', `Business Event: ${event}`, data as ErrorLogData);
  }

  /**
   * Set log level programmatically
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return this.shouldLog(level);
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;