import { useMemo } from 'react';
import logger from '@/lib/logger';

/**
 * Custom hook for API configuration
 * Centralizes environment variables and provides type safety
 */
export const useApiConfig = () => {
  return useMemo(() => {
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;
    const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

    if (!API) {
      logger.warn('NEXT_PUBLIC_API_BASE_URL is not configured');
    }

    if (!URLFile) {
      logger.warn('NEXT_PUBLIC_PICHER_BASE_URL is not configured');
    }

    return {
      API,
      URLFile,
      // Helper function to construct full image URL
      getImageUrl: (path: string | null | undefined): string => {
        if (!path || !URLFile) return '';
        return path.startsWith('http') ? path : `${URLFile}${path}`;
      },
      // Helper function to construct API URL
      getApiUrl: (endpoint: string): string => {
        if (!API) return '';
        return endpoint.startsWith('/') ? `${API}${endpoint}` : `${API}/${endpoint}`;
      }
    };
  }, []);
};

export default useApiConfig;