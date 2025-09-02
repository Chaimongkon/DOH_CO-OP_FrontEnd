"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { message } from "antd";
import { Services } from "@/types";
import logger from "@/lib/logger";

// Simple in-memory cache for service data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let servicesCache: {
  data: Services[] | null;
  timestamp: number;
  subcategory: string;
} = {
  data: null,
  timestamp: 0,
  subcategory: ''
};

interface ServiceApiResponse {
  Id: number;
  ImagePath: string;
  Subcategories: string;
  URLLink: string;
  IsActive: boolean;
}

interface UseServiceDataReturn {
  service: Services[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  cacheUsed: boolean;
}

/**
 * Custom hook for fetching and managing service data
 * @param subcategory - The subcategory to filter services by
 * @param endpoint - Optional custom endpoint (defaults to "/Serve")
 * @returns Object containing service data, loading state, error state, and refetch function
 */
export const useServiceData = (
  subcategory: string,
  endpoint: string = "/Serve"
): UseServiceDataReturn => {
  const [service, setService] = useState<Services[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  const lastRequestTime = useRef(0);
  const hasInitialized = useRef(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;
  
  // Memoize endpoint to prevent unnecessary re-renders
  const memoizedEndpoint = useMemo(() => endpoint, [endpoint]);

  const fetchServiceData = useCallback(async () => {
    if (!API || !URLFile) {
      const errorMsg = "API configuration is missing";
      logger.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    if (!subcategory) {
      const errorMsg = "Subcategory is required";
      logger.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Check cache first
      const now = Date.now();
      if (servicesCache.data && 
          servicesCache.subcategory === subcategory && 
          (now - servicesCache.timestamp) < CACHE_DURATION) {
        logger.info('Using cached services data for subcategory:', { subcategory });
        setService(servicesCache.data);
        setCacheUsed(true);
        return;
      }

      // Implement request throttling (minimum 3 seconds for 429 prevention)
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 3000) {
        const delay = 3000 - timeSinceLastRequest;
        logger.info(`Throttling services request, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastRequestTime.current = Date.now();
      setCacheUsed(false);
      setLoading(true);

      const response = await fetch(`${API}${memoizedEndpoint}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("กำลังโหลดข้อมูลบริการหนักเกินไป กรุณารอสักครู่และลองใหม่อีกครั้ง");
        }
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const data = result.data || result;

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }

      const processedData: Services[] = data
        .map((serviceItem: ServiceApiResponse) => ({
          id: serviceItem.Id,
          imagePath: serviceItem.ImagePath ? `${URLFile}${serviceItem.ImagePath}` : "",
          subcategories: serviceItem.Subcategories,
          urlLink: serviceItem.URLLink || "",
          urlLinks: serviceItem.URLLink
            ? serviceItem.URLLink.split(",").map((link: string) => link.trim())
            : [],
          status: serviceItem.IsActive,
        }))
        .filter((serviceItem: Services) => 
          serviceItem.subcategories === subcategory && serviceItem.status
        );

      // Cache the result
      servicesCache = {
        data: processedData,
        timestamp: Date.now(),
        subcategory: subcategory
      };
      
      setService(processedData);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch service data";
      logger.error("Failed to fetch service data:", error);
      
      // If we have cached data and it's a network error, use the cache
      if (servicesCache.data && servicesCache.subcategory === subcategory) {
        logger.info('Network error detected, falling back to cached services data');
        setService(servicesCache.data);
        setCacheUsed(true);
        setError(null); // Clear error since we have fallback data
      } else {
        setError(errorMessage);
        message.error("ไม่สามารถโหลดข้อมูลบริการได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  }, [API, URLFile, memoizedEndpoint, subcategory]);

  const refetch = useCallback(async () => {
    await fetchServiceData();
  }, [fetchServiceData]);

  useEffect(() => {
    // Only execute once on component mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchServiceData();
    }
  }, [fetchServiceData]);

  return {
    service,
    loading,
    error,
    refetch,
    cacheUsed,
  };
};

export default useServiceData;