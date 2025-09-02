"use client";
import { useEffect, useRef, memo } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

/**
 * Analytics Provider Component
 * Initializes analytics tracking and monitors page changes
 */
const AnalyticsProvider = memo(function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastPathnameRef = useRef<string>('');

  useEffect(() => {
    // Only track if pathname actually changed
    if (analytics && pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
      analytics.trackPageView(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    // Track session end on page unload (only in browser with analytics)
    if (typeof window === 'undefined' || !analytics || typeof navigator === 'undefined') {
      return;
    }

    const handleBeforeUnload = () => {
      if (analytics) {
        const summary = analytics.getSessionSummary();
        
        // Send session summary
        navigator.sendBeacon(
          '/api/analytics/session-end',
          JSON.stringify(summary)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
});

export default AnalyticsProvider;