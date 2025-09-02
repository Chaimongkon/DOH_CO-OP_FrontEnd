import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Replay sampling for session recording
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment and release tracking
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'dev',
  
  // Debugging - disabled for cleaner console
  debug: false,
  
  // Error filtering
  beforeSend(event) {
    // Skip all events in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Skip hydration errors in development
    if (event.exception?.values?.[0]?.value?.includes('Hydration')) {
      return null;
    }
    
    // Skip network errors for external resources
    if (event.exception?.values?.[0]?.value?.includes('Loading chunk')) {
      return null;
    }
    
    return event;
  },
  
  // Performance monitoring configuration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

// Export router transition start hook for navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;