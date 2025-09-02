"use client";

import React, { createContext, useContext, useCallback, useState, useEffect, useMemo, ReactNode } from 'react';
import logger from '@/lib/logger';
import { SuccessApiResponse } from '@/types/api-responses';

interface StatusApiResponse {
  Id: number;
  Status: number;
}


interface StatusHomeContextType {
  isElectionMode: boolean;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

const StatusHomeContext = createContext<StatusHomeContextType | undefined>(undefined);

interface StatusHomeProviderProps {
  children: ReactNode;
}

export const StatusHomeProvider: React.FC<StatusHomeProviderProps> = ({ children }) => {
  const [isElectionMode, setIsElectionMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize API URL
  const API = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL, []);

  const fetchStatus = useCallback(async (): Promise<void> => {
    if (!API) {
      logger.warn("API URL not configured for status fetch");
      setError("API configuration missing");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`${API}/StatusHome`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Always fetch fresh data for status
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse: SuccessApiResponse<StatusApiResponse[]> = await response.json();
      
      if (!apiResponse.success || !Array.isArray(apiResponse.data)) {
        throw new Error('Invalid status API response format');
      }

      // ค้นหารายการที่มี Id เท่ากับ 1 และตรวจสอบ Status
      const statusItem = apiResponse.data.find((item): item is StatusApiResponse => 
        item && typeof item.Id === 'number' && item.Id === 1
      );
      
      const newElectionMode = statusItem?.Status === 1;
      setIsElectionMode(newElectionMode);
      
      logger.info('StatusHome loaded successfully', {
        isElectionMode: newElectionMode,
        statusId: statusItem?.Id,
        statusValue: statusItem?.Status
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error("Failed to fetch status:", error);
      setError(errorMessage);
      setIsElectionMode(false); // Default to application mode on error
    } finally {
      setIsLoading(false);
    }
  }, [API]);

  const refreshStatus = useCallback(async (): Promise<void> => {
    if (!API) {
      logger.warn("API URL not configured for status refresh");
      setError("API configuration missing");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API}/StatusHome`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse: SuccessApiResponse<StatusApiResponse[]> = await response.json();
      
      if (!apiResponse.success || !Array.isArray(apiResponse.data)) {
        throw new Error('Invalid status API response format');
      }

      const statusItem = apiResponse.data.find((item): item is StatusApiResponse => 
        item && typeof item.Id === 'number' && item.Id === 1
      );
      
      const newElectionMode = statusItem?.Status === 1;
      setIsElectionMode(newElectionMode);
      
      logger.info('StatusHome refreshed successfully', {
        isElectionMode: newElectionMode,
        statusId: statusItem?.Id,
        statusValue: statusItem?.Status
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error("Failed to refresh status:", error);
      setError(errorMessage);
      setIsElectionMode(false);
    } finally {
      setIsLoading(false);
    }
  }, [API]);  // Only depend on API which is stable

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);  // Include fetchStatus but it's stable due to memoization

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isElectionMode,
    isLoading,
    error,
    refreshStatus
  }), [isElectionMode, isLoading, error, refreshStatus]);

  return (
    <StatusHomeContext.Provider value={contextValue}>
      {children}
    </StatusHomeContext.Provider>
  );
};

// Custom hook to use StatusHome context
export const useStatusHome = (): StatusHomeContextType => {
  const context = useContext(StatusHomeContext);
  
  if (context === undefined) {
    throw new Error('useStatusHome must be used within a StatusHomeProvider');
  }
  
  return context;
};

// HOC for components that need status home functionality
export const withStatusHome = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <StatusHomeProvider>
      <Component {...props} />
    </StatusHomeProvider>
  );
  
  WrappedComponent.displayName = `withStatusHome(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default StatusHomeContext;