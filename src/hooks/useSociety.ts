import { useState, useCallback, useEffect } from 'react';
import { Society } from '@/types/about';
import { ApiSociety } from '@/types';
import { getApiConfig } from '@/lib/config';
import logger from '@/lib/logger';

interface UseSocietyReturn {
  society: Society[];
  loading: boolean;
  error: string | null;
  fetchImages: () => Promise<void>;
  societyType: string;
}

export const useSociety = (
  filterType: string,
  initialData: Society[] = []
): UseSocietyReturn => {
  const [society, setSociety] = useState<Society[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const { apiUrl, fileUrl } = getApiConfig();
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/SocietyCoop`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data: ApiSociety[] = await response.json();

      const processedData: Society[] = data
        .map((society: ApiSociety) => ({
          id: society.Id,
          imagePath: society.ImagePath ? `${fileUrl}${society.ImagePath}` : "",
          societyType: society.SocietyType,
          status: society.IsActive,
        }))
        .filter(
          (society: Society) =>
            society.societyType === filterType && 
            society.status && 
            society.imagePath
        );

      setSociety(processedData);
    } catch (error) {
      logger.error(`Failed to fetch ${filterType} images:`, error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  // Auto-fetch data if initialData is empty (client-side navigation)
  useEffect(() => {
    if (initialData.length === 0) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.length]);

  return {
    society,
    loading,
    error,
    fetchImages,
    societyType: filterType,
  };
};