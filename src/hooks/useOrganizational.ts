import { useState, useCallback } from 'react';
import { BoardMember, ApiOrganizational } from '@/types/organizational';
import { getApiConfig } from '@/lib/config';
import logger from '@/lib/logger';

interface UseOrganizationalReturn {
  organizationals: BoardMember[];
  loading: boolean;
  error: string | null;
  fetchOrganizational: () => Promise<void>;
  organizationType: string;
}

export const useOrganizational = (
  filterType: string,
  initialData: BoardMember[] = []
): UseOrganizationalReturn => {
  const [organizationals, setOrganizationals] = useState<BoardMember[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizational = useCallback(async () => {
    try {
      const { apiUrl, fileUrl } = getApiConfig();
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/Organizational`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const responseData = await response.json();
      const data: ApiOrganizational[] = responseData.data || [];

      const filteredData = data.filter(
        (item: ApiOrganizational) => item.Type === filterType
      );

      const processedData: BoardMember[] = filteredData.map((item: ApiOrganizational) => ({
        id: item.Id,
        name: item.Name,
        position: item.Position,
        priority: String(item.Priority),
        type: item.Type,
        imagePath: item.ImagePath ? `${fileUrl}${item.ImagePath}` : "",
      }));

      setOrganizationals(processedData);
    } catch (error) {
      logger.error(`Failed to fetch ${filterType}:`, error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  return {
    organizationals,
    loading,
    error,
    fetchOrganizational,
    organizationType: filterType,
  };
};