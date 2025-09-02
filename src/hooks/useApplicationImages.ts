import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { Application, ImageWithDimensions, LightboxImage } from '@/types';
import logger from '@/lib/logger';
import { useApiConfig } from '@/hooks/useApiConfig';

interface UseApplicationImagesResult {
  app: Application[];
  imagesWithDimensions: ImageWithDimensions[];
  lightboxImages: LightboxImage[];
  loading: boolean;
  error: string | null;
  retryFetch: () => void;
  // Lightbox state and handlers
  lightboxIndex: number;
  handleImageClick: (idx: number) => void;
  handleCloseLightbox: () => void;
  handleKeyDown: (event: React.KeyboardEvent, idx: number) => void;
}

export const useApplicationImages = (
  endpoint: string = "/Application", 
  filterType: string = "การดาวน์โหลด"
): UseApplicationImagesResult => {
  const [app, setApp] = useState<Application[]>([]);
  const [imagesWithDimensions, setImagesWithDimensions] = useState<ImageWithDimensions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  
  const { getApiUrl } = useApiConfig();

  const getImageDimensions = useCallback((src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error(`ไม่สามารถโหลดรูปภาพได้: ${src}`));
      img.src = src;
    });
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = getApiUrl(endpoint);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการเรียกข้อมูล: ${response.status}`);
      }
      
      const result = await response.json();
      const data = result.data || result;

      const processedData: Application[] = data
        .map((app: { Id: number; Title: string; Detail: string; ImageNumber: number; ImagePath: string; ApplicationMainType: string; ApplicationType: string }) => {
          const fullImagePath = app.ImagePath || "";
          logger.info(`Processing image path: ${app.ImagePath}`);
          return {
            id: app.Id,
            title: app.Title,
            detail: app.Detail,
            imageNumber: app.ImageNumber,
            imagePath: fullImagePath,
            applicationMainType: app.ApplicationMainType,
            applicationType: app.ApplicationType,
          };
        })
        .filter((app: Application) => app.applicationType === filterType);

      setApp(processedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      logger.error("Failed to fetch images:", error);
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, endpoint, filterType]);

  const loadImagesWithDimensions = useCallback(async () => {
    if (app.length === 0) return;
    
    try {
      const imagesWithDims = await Promise.all(
        app.map(async (appItem) => {
          try {
            const { width, height } = await getImageDimensions(appItem.imagePath);
            return { src: appItem.imagePath, width, height };
          } catch (error) {
            logger.error(`Failed to load image dimensions for: ${appItem.imagePath}`, error);
            // Return default dimensions if image fails to load
            return { src: appItem.imagePath, width: 400, height: 300 };
          }
        })
      );
      setImagesWithDimensions(imagesWithDims);
    } catch (error) {
      logger.error("Failed to load image dimensions:", error);
      message.error("ไม่สามารถโหลดขนาดรูปภาพได้");
    }
  }, [app, getImageDimensions]);

  const retryFetch = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  // Memoized lightbox images array
  const lightboxImages: LightboxImage[] = useMemo(() => 
    imagesWithDimensions.map((photo) => ({
      src: photo.src,
    })), [imagesWithDimensions]
  );

  // Lightbox handlers
  const handleImageClick = useCallback((idx: number) => {
    setLightboxIndex(idx);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(-1);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, idx: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleImageClick(idx);
    }
  }, [handleImageClick]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (app.length > 0) {
      loadImagesWithDimensions();
    }
  }, [app, loadImagesWithDimensions]);

  return {
    app,
    imagesWithDimensions,
    lightboxImages,
    loading,
    error,
    retryFetch,
    // Lightbox state and handlers
    lightboxIndex,
    handleImageClick,
    handleCloseLightbox,
    handleKeyDown
  };
};