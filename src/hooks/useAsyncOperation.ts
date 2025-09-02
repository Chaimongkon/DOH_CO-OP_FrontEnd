"use client";

import { useState, useCallback, useRef } from "react";
import { message } from "antd";
import logger from "@/lib/logger";

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface AsyncOperationOptions {
  showErrorMessage?: boolean;
  errorMessage?: string;
  logErrors?: boolean;
}

export interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling async operations with loading, error states, and cleanup
 * Eliminates repetitive loading/error handling code across components
 * 
 * @param asyncFunction - The async function to execute
 * @param options - Configuration options for error handling and messages
 * @returns Object containing data, loading state, error state, execute function, and reset function
 */
export function useAsyncOperation<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: AsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const {
    showErrorMessage = true,
    errorMessage = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    logErrors = true,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      // Cancel any ongoing operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this operation
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const result = await asyncFunction(...args);
        
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        setState({
          data: result,
          loading: false,
          error: null,
        });

        return result;
      } catch (error) {
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
        
        if (logErrors) {
          logger.error("Async operation failed:", error);
        }

        setState({
          data: null,
          loading: false,
          error: errorMsg,
        });

        if (showErrorMessage) {
          message.error(errorMessage);
        }

        return null;
      }
    },
    [asyncFunction, showErrorMessage, errorMessage, logErrors]
  );

  const reset = useCallback(() => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

/**
 * Variant for operations that don't return data (e.g., POST, DELETE operations)
 */
export function useAsyncAction(
  asyncFunction: (...args: unknown[]) => Promise<void>,
  options: AsyncOperationOptions = {}
): Omit<UseAsyncOperationReturn<void>, 'data'> {
  const { execute, loading, error, reset } = useAsyncOperation(asyncFunction, options);

  return {
    loading,
    error,
    execute,
    reset,
  };
}

export default useAsyncOperation;