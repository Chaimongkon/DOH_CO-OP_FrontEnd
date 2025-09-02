/**
 * Web Vitals Analytics and Performance Monitoring
 * Tracks Core Web Vitals and user interactions
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import logger from './logger';

interface AnalyticsEvent {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  pageViews: number;
  interactions: number;
  errors: number;
}

class Analytics {
  private session: UserSession;
  private vitalsData: AnalyticsEvent[] = [];
  private lastTrackedPage: string = '';

  constructor() {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 1,
      interactions: 0,
      errors: 0
    };

    // Only initialize client-side features in browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.initializeWebVitals();
      this.trackUserInteractions();
      this.trackNavigationTiming();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWebVitals() {
    // Track Core Web Vitals
    onCLS(this.onVitalMetric.bind(this));
    onINP(this.onVitalMetric.bind(this));
    onFCP(this.onVitalMetric.bind(this));
    onLCP(this.onVitalMetric.bind(this));
    onTTFB(this.onVitalMetric.bind(this));
  }

  private onVitalMetric(metric: AnalyticsEvent) {
    // Store the metric
    this.vitalsData.push(metric);
    
    // Log performance data
    logger.info(`Web Vital - ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id
    });

    // Send to analytics service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('web-vital', metric);
    }
  }

  private trackUserInteractions() {
    // Only track interactions in browser environment
    if (typeof document === 'undefined') return;
    
    // Throttle click tracking to prevent excessive events
    let clickThrottle = 0;
    
    // Track clicks
    document.addEventListener('click', (event) => {
      const now = Date.now();
      if (now - clickThrottle < 100) return; // Throttle to max 10 per second
      
      clickThrottle = now;
      this.session.interactions++;
      
      const target = event.target as HTMLElement;
      this.trackEvent('click', {
        element: target.tagName,
        id: target.id || 'unknown',
        className: target.className || 'none',
        text: target.textContent?.substring(0, 50) || ''
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form-submit', {
        formId: form.id || 'unknown',
        action: form.action || 'none'
      });
    });

    // Track scroll depth with throttling
    let maxScrollDepth = 0;
    let scrollThrottle = 0;
    
    document.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - scrollThrottle < 250) return; // Throttle to 4 per second max
      
      scrollThrottle = now;
      
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track scroll milestones
        if (scrollDepth % 25 === 0 && scrollDepth > 0) {
          this.trackEvent('scroll-depth', { depth: scrollDepth });
        }
      }
    });
  }

  private trackNavigationTiming() {
    // Only track navigation timing in browser environment
    if (typeof window === 'undefined') return;
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navTiming) {
          const metrics = {
            dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
            tcp: navTiming.connectEnd - navTiming.connectStart,
            request: navTiming.responseStart - navTiming.requestStart,
            response: navTiming.responseEnd - navTiming.responseStart,
            domInteractive: navTiming.domInteractive - navTiming.requestStart,
            domComplete: navTiming.domComplete - navTiming.domInteractive,
            loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart
          };

          logger.info('Navigation Timing:', metrics);
          this.sendToAnalytics('navigation-timing', metrics);
        }
      }, 1000);
    });
  }

  public trackEvent(eventName: string, properties: Record<string, unknown> = {}) {
    const event = {
      name: eventName,
      sessionId: this.session.sessionId,
      timestamp: Date.now(),
      properties,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      viewport: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight
      } : { width: 0, height: 0 }
    };

    logger.info(`Analytics Event - ${eventName}:`, properties);

    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('custom-event', event);
    }
  }

  public trackError(error: Error, errorInfo?: unknown) {
    this.session.errors++;
    
    const errorEvent = {
      message: error.message,
      stack: error.stack,
      errorInfo,
      sessionId: this.session.sessionId,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    logger.error('Analytics Error:', errorEvent);
    this.sendToAnalytics('error', errorEvent);
  }

  public trackPageView(page: string) {
    // Don't increment if same page (prevents infinite loops)
    const currentPage = typeof window !== 'undefined' ? window.location.pathname : page;
    if (this.lastTrackedPage === currentPage) {
      return;
    }
    
    this.lastTrackedPage = currentPage;
    this.session.pageViews++;
    
    const pageViewEvent = {
      page,
      sessionId: this.session.sessionId,
      timestamp: Date.now(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      title: typeof document !== 'undefined' ? document.title : ''
    };

    logger.info('Page View:', pageViewEvent);
    this.sendToAnalytics('page-view', pageViewEvent);
  }

  private async sendToAnalytics(type: string, data: unknown) {
    try {
      // In production, send to your analytics service
      // For now, we'll just store in localStorage for debugging
      const analyticsData = {
        type,
        data,
        timestamp: Date.now()
      };

      // Store locally for debugging (only in browser) - with try-catch to prevent errors
      if (typeof localStorage !== 'undefined') {
        try {
          const stored = localStorage.getItem('doh-analytics') || '[]';
          const analytics = JSON.parse(stored);
          analytics.push(analyticsData);
          
          // Keep only last 100 events
          if (analytics.length > 100) {
            analytics.splice(0, analytics.length - 100);
          }
          
          localStorage.setItem('doh-analytics', JSON.stringify(analytics));
        } catch (storageError) {
          // Ignore localStorage errors to prevent affecting UI
          logger.warn('Analytics localStorage error:', { error: storageError instanceof Error ? storageError.message : String(storageError) });
        }
      }

      // TODO: Send to actual analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analyticsData)
      // });

    } catch (error) {
      logger.error('Failed to send analytics:', error);
    }
  }

  public getSessionSummary() {
    return {
      ...this.session,
      duration: Date.now() - this.session.startTime,
      vitals: this.vitalsData
    };
  }

  public exportAnalyticsData() {
    // Only export in browser environment
    if (typeof localStorage === 'undefined' || typeof document === 'undefined') {
      logger.warn('Analytics export not available in server environment');
      return;
    }

    const data = localStorage.getItem('doh-analytics');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doh-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}

// Create global analytics instance (only in browser)
export const analytics = typeof window !== 'undefined' ? new Analytics() : null;

// Export for debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).DOHAnalytics = analytics;
}

export default analytics;