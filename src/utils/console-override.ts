// Console override to filter out unwanted warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  const originalWarn = console.warn;
  // eslint-disable-next-line no-console
  const originalError = console.error;

  // eslint-disable-next-line no-console
  console.warn = (...args: unknown[]) => {
    const message = args.join(' ');
    
    // Filter out image optimization warnings
    if (message.includes('has either width or height modified')) {
      return;
    }
    
    // Filter out React warnings we don't care about in development
    if (message.includes('Download the React DevTools')) {
      return;
    }
    
    // Allow other warnings to pass through
    originalWarn.apply(console, args);
  };

  // eslint-disable-next-line no-console
  console.error = (...args: unknown[]) => {
    const message = args.join(' ');
    
    // Filter out hydration errors in development
    if (message.includes('Hydration failed')) {
      return;
    }
    
    // Filter out Sentry transport errors
    if (message.includes('Transport disabled')) {
      return;
    }
    
    // Allow other errors to pass through
    originalError.apply(console, args);
  };
}

export {};