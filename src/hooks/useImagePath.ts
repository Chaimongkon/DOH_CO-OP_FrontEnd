import { useMemo, useCallback } from 'react';
import { 
  processImagePath, 
  sanitizeImageUrl, 
  isValidImageExtension,
  isValidUrl,
  isExternalUrl
} from '@/utils/url-validator';
import logger from '@/lib/logger';

export interface ImageProcessingOptions {
  /** Base URL for file serving */
  baseUrl: string;
  /** Whether to validate image extensions */
  validateExtension?: boolean;
  /** Whether to sanitize URLs for security */
  sanitizeUrl?: boolean;
  /** Whether to log validation warnings */
  enableLogging?: boolean;
  /** Fallback image URL if processing fails */
  fallbackUrl?: string;
  /** Custom image validation function */
  customValidator?: (url: string) => boolean;
}

export interface ProcessedImageResult {
  /** Final processed image URL */
  url: string | null;
  /** Whether the image URL is valid */
  isValid: boolean;
  /** Whether the image is from external source */
  isExternal: boolean;
  /** Error message if processing failed */
  error?: string;
  /** Original input path */
  originalPath: string | null;
}

export interface UseImagePathReturn {
  /** Process a single image path */
  processImage: (
    imagePath: string | null | undefined,
    options?: Partial<ImageProcessingOptions>
  ) => ProcessedImageResult;
  
  /** Process multiple image paths in batch */
  processImageBatch: (
    imagePaths: (string | null | undefined)[],
    options?: Partial<ImageProcessingOptions>
  ) => ProcessedImageResult[];
  
  /** Process API response with image and file paths */
  processApiImagePaths: <T extends Record<string, unknown>>(
    apiData: T,
    pathMappings: Record<keyof T, string>,
    options?: Partial<ImageProcessingOptions>
  ) => T & Record<string, string>;
  
  /** Get safe image URL with fallback */
  getSafeImageUrl: (
    imagePath: string | null | undefined,
    fallback?: string
  ) => string;
  
  /** Validate image URL */
  validateImageUrl: (url: string) => boolean;
  
  /** Check if image URL is external */
  isExternalImage: (url: string) => boolean;
}

/**
 * Custom hook for processing and validating image paths
 * 
 * @param defaultOptions - Default processing options
 * 
 * @example
 * ```tsx
 * const { processImage, processApiImagePaths, getSafeImageUrl } = useImagePath({
 *   baseUrl: process.env.NEXT_PUBLIC_PICHER_BASE_URL || '',
 *   validateExtension: true,
 *   sanitizeUrl: true,
 *   enableLogging: true
 * });
 * 
 * // Process single image
 * const result = processImage(imagePathFromApi);
 * 
 * // Process API data
 * const processedData = apiData.map(item => processApiImagePaths(item, {
 *   ImagePath: 'imagePath',
 *   PdfPath: 'pdfPath'
 * }));
 * 
 * // Get safe URL with fallback
 * const safeUrl = getSafeImageUrl(imagePath, '/image/placeholder.png');
 * ```
 */
export function useImagePath(
  defaultOptions: ImageProcessingOptions
): UseImagePathReturn {
  
  // Memoized default options with fallbacks
  const options = useMemo(() => ({
    validateExtension: true,
    sanitizeUrl: true,
    enableLogging: true,
    fallbackUrl: '/image/placeholder.png',
    ...defaultOptions,
  }), [defaultOptions]);

  // Process a single image path
  const processImage = useCallback((
    imagePath: string | null | undefined,
    customOptions?: Partial<ImageProcessingOptions>
  ): ProcessedImageResult => {
    const opts = { ...options, ...customOptions };
    const originalPath = imagePath || null;
    
    // Handle null/undefined/empty paths
    if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
      return {
        url: null,
        isValid: false,
        isExternal: false,
        error: 'Image path is empty or invalid',
        originalPath,
      };
    }

    try {
      // Step 1: Process the image path
      const processedPath = processImagePath(imagePath, opts.baseUrl);
      
      if (!processedPath) {
        const error = 'Failed to process image path';
        if (opts.enableLogging) {
          logger.warn('Image path processing failed', {
            originalPath: imagePath,
            baseUrl: opts.baseUrl
          });
        }
        return {
          url: opts.fallbackUrl || null,
          isValid: false,
          isExternal: false,
          error,
          originalPath,
        };
      }

      // Step 2: Sanitize URL if enabled
      let finalUrl = processedPath;
      if (opts.sanitizeUrl) {
        const sanitizedUrl = sanitizeImageUrl(processedPath);
        if (!sanitizedUrl) {
          const error = 'URL failed security validation';
          if (opts.enableLogging) {
            logger.warn('Image URL sanitization failed', {
              originalPath: imagePath,
              processedPath
            });
          }
          return {
            url: opts.fallbackUrl || null,
            isValid: false,
            isExternal: false,
            error,
            originalPath,
          };
        }
        finalUrl = sanitizedUrl;
      }

      // Step 3: Validate image extension if enabled
      if (opts.validateExtension && !isValidImageExtension(finalUrl)) {
        const error = 'Invalid image file extension';
        if (opts.enableLogging) {
          logger.warn('Invalid image extension detected', {
            originalPath: imagePath,
            finalUrl
          });
        }
        return {
          url: opts.fallbackUrl || null,
          isValid: false,
          isExternal: isExternalUrl(finalUrl),
          error,
          originalPath,
        };
      }

      // Step 4: Custom validation if provided
      if (opts.customValidator && !opts.customValidator(finalUrl)) {
        const error = 'Custom validation failed';
        if (opts.enableLogging) {
          logger.warn('Custom image validation failed', {
            originalPath: imagePath,
            finalUrl
          });
        }
        return {
          url: opts.fallbackUrl || null,
          isValid: false,
          isExternal: isExternalUrl(finalUrl),
          error,
          originalPath,
        };
      }

      // Success!
      return {
        url: finalUrl,
        isValid: true,
        isExternal: isExternalUrl(finalUrl),
        originalPath,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during image processing';
      
      if (opts.enableLogging) {
        logger.error('Image path processing error', {
          originalPath: imagePath,
          error: errorMessage
        });
      }

      return {
        url: opts.fallbackUrl || null,
        isValid: false,
        isExternal: false,
        error: errorMessage,
        originalPath,
      };
    }
  }, [options]);

  // Process multiple image paths in batch
  const processImageBatch = useCallback((
    imagePaths: (string | null | undefined)[],
    customOptions?: Partial<ImageProcessingOptions>
  ): ProcessedImageResult[] => {
    return imagePaths.map(path => processImage(path, customOptions));
  }, [processImage]);

  // Process API response with image paths
  const processApiImagePaths = useCallback(<T extends Record<string, unknown>>(
    apiData: T,
    pathMappings: Record<keyof T, string>,
    customOptions?: Partial<ImageProcessingOptions>
  ): T & Record<string, string> => {
    const result = { ...apiData };
    
    Object.entries(pathMappings).forEach(([sourceKey, targetKey]) => {
      const imagePath = apiData[sourceKey as keyof T] as string;
      const processed = processImage(imagePath, customOptions);
      
      // Add processed path to result
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as Record<string, any>)[targetKey] = processed.url || '';
    });

    return result as T & Record<string, string>;
  }, [processImage]);

  // Get safe image URL with fallback
  const getSafeImageUrl = useCallback((
    imagePath: string | null | undefined,
    fallback?: string
  ): string => {
    const processed = processImage(imagePath, { fallbackUrl: fallback });
    return processed.url || fallback || options.fallbackUrl || '/image/placeholder.png';
  }, [processImage, options.fallbackUrl]);

  // Validate image URL
  const validateImageUrl = useCallback((url: string): boolean => {
    try {
      if (!url || url.trim() === '') return false;
      
      // Check if it's a valid URL format
      if (isExternalUrl(url)) {
        return isValidUrl(url);
      }
      
      // For relative paths, just check if it's a non-empty string
      return url.trim().length > 0;
    } catch {
      return false;
    }
  }, []);

  // Check if image URL is external
  const isExternalImage = useCallback((url: string): boolean => {
    return isExternalUrl(url);
  }, []);

  // Memoized return object
  return useMemo(() => ({
    processImage,
    processImageBatch,
    processApiImagePaths,
    getSafeImageUrl,
    validateImageUrl,
    isExternalImage,
  }), [
    processImage,
    processImageBatch,
    processApiImagePaths,
    getSafeImageUrl,
    validateImageUrl,
    isExternalImage,
  ]);
}

export default useImagePath;