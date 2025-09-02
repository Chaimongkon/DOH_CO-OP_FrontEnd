"use client";

import { useState, useCallback, useRef, useMemo } from "react";

export interface UseButtonLoadingReturn {
  buttonLoading: { [key: string]: boolean };
  isLoading: (key: string | number) => boolean;
  setLoading: (key: string | number, loading: boolean) => void;
  withLoading: <T extends unknown[]>(
    key: string | number,
    fn: (...args: T) => Promise<void> | void
  ) => (...args: T) => Promise<void>;
  resetAll: () => void;
}

/**
 * Custom hook for managing multiple button loading states
 * Eliminates repetitive button loading state management code
 * 
 * @returns Object containing loading states and utility functions
 * 
 * @example
 * const { isLoading, withLoading } = useButtonLoading();
 * 
 * const handleClick = withLoading('button1', async () => {
 *   await someAsyncOperation();
 * });
 * 
 * <Button loading={isLoading('button1')} onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export function useButtonLoading(): UseButtonLoadingReturn {
  const [buttonLoading, setButtonLoading] = useState<{ [key: string]: boolean }>({});
  const buttonLoadingRef = useRef(buttonLoading);
  
  // Keep ref in sync with state
  buttonLoadingRef.current = buttonLoading;

  const setLoading = useCallback((key: string | number, loading: boolean) => {
    setButtonLoading(prev => ({
      ...prev,
      [String(key)]: loading
    }));
  }, []);

  const withLoading = useCallback(<T extends unknown[]>(
    key: string | number,
    fn: (...args: T) => Promise<void> | void
  ) => {
    return async (...args: T): Promise<void> => {
      setLoading(key, true);
      try {
        await fn(...args);
      } finally {
        setLoading(key, false);
      }
    };
  }, [setLoading]);

  const resetAll = useCallback(() => {
    setButtonLoading({});
  }, []);

  // Create stable references using useCallback with proper dependencies
  const stableIsLoading = useCallback((key: string | number): boolean => {
    return buttonLoading[String(key)] || false;
  }, [buttonLoading]);

  return useMemo(() => ({
    buttonLoading,
    isLoading: stableIsLoading,
    setLoading,
    withLoading,
    resetAll,
  }), [buttonLoading, stableIsLoading, setLoading, withLoading, resetAll]);
}

export default useButtonLoading;