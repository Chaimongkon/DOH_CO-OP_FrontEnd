import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { Services } from '@/types';
import logger from '@/lib/logger';

interface UseServicesReturn {
  services: Services[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useServices = (
  subcategory: string,
  initialData: Services[] = []
): UseServicesReturn => {
  const [services, setServices] = useState<Services[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  const fetchServices = useCallback(async () => {
    if (!API || !URLFile) {
      const errorMsg = 'API configuration is missing';
      setError(errorMsg);
      logger.error(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API}/Serve`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const result = await response.json();
      const data = result.data || result;

      const processedData: Services[] = data
        .map((service: { 
          Id: number; 
          ImagePath: string; 
          Subcategories: string; 
          URLLink: string; 
          IsActive: boolean 
        }) => ({
          id: service.Id,
          imagePath: service.ImagePath ? `${URLFile}${service.ImagePath}` : '',
          subcategories: service.Subcategories,
          urlLink: service.URLLink,
          urlLinks: service.URLLink 
            ? service.URLLink.split(',').map((link: string) => link.trim())
            : [],
          status: service.IsActive,
        }))
        .filter((service: Services) => 
          service.subcategories === subcategory && service.status
        );

      setServices(processedData);
    } catch (error) {
      const errorMsg = 'Failed to fetch services data';
      logger.error(`${errorMsg}:`, error);
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [API, URLFile, subcategory]);

  const refetch = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    // Only execute once on component mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchServices();
    }
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    refetch,
  };
};