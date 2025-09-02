export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    const Sentry = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      
      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Environment and release tracking
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || 'dev',
      
      // Debugging
      debug: process.env.NODE_ENV === 'development',
      
      // Error filtering for server-side
      beforeSend(event) {
        // Skip database connection timeouts in development
        if (process.env.NODE_ENV === 'development' && 
            event.exception?.values?.[0]?.value?.includes('ECONNREFUSED')) {
          return null;
        }
        
        // Log server errors for monitoring
        if (event.level === 'error') {
          console.error('Sentry Server Error:', {
            message: event.message,
            exception: event.exception?.values?.[0],
            tags: event.tags,
            timestamp: event.timestamp
          });
        }
        
        return event;
      },
      
      // Server-side integrations
      integrations: [
        // Database monitoring
        Sentry.prismaIntegration(),
        // HTTP monitoring  
        Sentry.httpIntegration(),
      ],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    const Sentry = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      
      // Minimal configuration for edge runtime
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
      
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || 'dev',
      
      debug: false, // Keep minimal for edge runtime
      
      beforeSend(event) {
        // Filter edge-specific errors
        if (event.exception?.values?.[0]?.value?.includes('EdgeRuntime')) {
          return null;
        }
        
        return event;
      },
    });
  }
}