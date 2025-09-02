"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import logger from "@/lib/logger";
import debounce from "lodash.debounce";

export interface UseLocalStorageOptions {
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
  syncAcrossTabs?: boolean;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for managing localStorage with React state synchronization
 * Eliminates repetitive localStorage operations and provides type safety
 * 
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist in localStorage
 * @param options - Configuration options for serialization and sync behavior
 * @returns Object containing value, setValue, removeValue, loading state, and error state
 * 
 * @example
 * const [menuName, setMenuName] = useLocalStorage('menuName', 'Default Menu');
 * const [userData, setUserData] = useLocalStorage('user', { name: '', email: '' });
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isFirstRender = useRef(true);

  // Initialize value from localStorage
  useEffect(() => {
    const initializeValue = async () => {
      try {
        setError(null);
        
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const storedValue = localStorage.getItem(key);
        
        if (storedValue !== null) {
          try {
            const parsedValue = deserialize(storedValue);
            // Only set if different to prevent unnecessary re-renders
            setValue(current => {
              const newValue = parsedValue as T;
              return current !== newValue ? newValue : current;
            });
          } catch (parseError) {
            logger.warn(`Failed to parse localStorage value for key "${key}":`, { error: parseError instanceof Error ? parseError.message : String(parseError) });
            // If parsing fails, use initial value and update localStorage
            setValue(current => current !== initialValue ? initialValue : current);
            localStorage.setItem(key, serialize(initialValue));
          }
        } else {
          // No stored value, use initial value and save to localStorage
          setValue(current => current !== initialValue ? initialValue : current);
          localStorage.setItem(key, serialize(initialValue));
        }
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Unknown localStorage error');
        setError(errorInstance);
        logger.error(`Error initializing localStorage for key "${key}":`, err);
        setValue(current => current !== initialValue ? initialValue : current);
      } finally {
        setIsLoading(false);
        isFirstRender.current = false;
      }
    };

    initializeValue();
  }, [key, initialValue, serialize, deserialize]);

  // Update localStorage when value changes (but not on first render)
  useEffect(() => {
    if (isFirstRender.current || isLoading || typeof window === 'undefined') {
      return;
    }

    try {
      setError(null);
      localStorage.setItem(key, serialize(value));
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error('Failed to save to localStorage');
      setError(errorInstance);
      logger.error(`Error saving to localStorage for key "${key}":`, err);
    }
  }, [key, value, serialize, isLoading]);

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) {
        return;
      }

      try {
        const newValue = deserialize(e.newValue);
        setValue(newValue as T);
        setError(null);
      } catch (err) {
        logger.warn(`Failed to sync localStorage value for key "${key}":`, { error: err instanceof Error ? err.message : String(err) });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, deserialize, syncAcrossTabs]);

  const valueRef = useRef(value);
  valueRef.current = value;

  // Debounced localStorage update to prevent rapid writes
  const debouncedSaveToStorage = useRef(debounce((key: string, value: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (storageError) {
        logger.warn(`Failed to save to localStorage for key "${key}":`, { error: storageError });
      }
    }
  }, 100)); // 100ms debounce

  // Create stable setter function using useRef
  const setStoredValueRef = useRef((newValue: T | ((prev: T) => T)) => {
    try {
      setError(null);
      
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(valueRef.current)
        : newValue;
      
      // Only set if the value actually changed
      setValue(current => {
        if (current === valueToStore) {
          return current; // No change, prevent re-render
        }
        return valueToStore;
      });
      
      // Update localStorage with debouncing
      debouncedSaveToStorage.current(key, serialize(valueToStore));
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error('Failed to update value');
      setError(errorInstance);
      logger.error(`Error updating localStorage value for key "${key}":`, err);
    }
  });

  const setStoredValue = setStoredValueRef.current;

  const removeStoredValue = useCallback(() => {
    try {
      setError(null);
      setValue(initialValue);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error('Failed to remove localStorage value');
      setError(errorInstance);
      logger.error(`Error removing localStorage value for key "${key}":`, err);
    }
  }, [key, initialValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    isLoading,
    error,
  };
}

/**
 * Simplified version for string values (most common use case)
 * 
 * @example
 * const [menuName, setMenuName] = useLocalStorageString('menuName', 'Default');
 */
export function useLocalStorageString(
  key: string,
  initialValue: string = "",
  options: UseLocalStorageOptions = {}
): [string, (value: string | ((prev: string) => string)) => void, () => void] {
  const { value, setValue, removeValue } = useLocalStorage(key, initialValue, {
    serialize: (val) => String(val),
    deserialize: (val) => val,
    ...options
  });

  // Create stable references to prevent infinite loops
  const stableSetValue = useCallback(setValue, [setValue]);
  const stableRemoveValue = useCallback(removeValue, [removeValue]);

  return [value, stableSetValue, stableRemoveValue];
}

/**
 * Hook specifically for the menuName pattern used throughout the app
 * 
 * @example
 * const [menuName, setMenuName] = useMenuName('Default Menu');
 */
export function useMenuName(defaultValue: string = ""): [string, (value: string) => void] {
  const [menuName, setMenuName] = useLocalStorageString('menuName', defaultValue, {
    syncAcrossTabs: false  // Disable cross-tab sync to prevent conflicts
  });
  
  const lastUpdateTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const menuNameRef = useRef<string>(menuName);
  const setMenuNameRef = useRef(setMenuName);
  
  // Keep refs in sync with state  
  menuNameRef.current = menuName;
  setMenuNameRef.current = setMenuName;
  
  // Create stable reference with anti-oscillation protection
  const stableSetMenuNameCallback = useCallback((value: string) => {
    const now = Date.now();
    updateCount.current += 1;
    const currentMenuName = menuNameRef.current;
    
    // Strong anti-oscillation: require 500ms gap and actual difference
    if (value && value !== currentMenuName && value.trim().length > 0) {
      if (now - lastUpdateTime.current > 500) {
        lastUpdateTime.current = now;
        logger.debug(`useMenuName: Setting menuName to "${value}" (update #${updateCount.current})`);
        setMenuNameRef.current(value);
      } else {
        logger.debug(`useMenuName: Anti-oscillation block - rejecting "${value}" (too soon after last update)`);
      }
    } else {
      logger.debug(`useMenuName: Rejecting invalid/duplicate value "${value}" (current: "${currentMenuName}")`);
    }
  }, []);
  
  return [menuName, stableSetMenuNameCallback];
}

export default useLocalStorage;