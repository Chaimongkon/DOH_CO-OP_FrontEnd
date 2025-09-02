/**
 * Application configuration and environment variables
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    pictureBaseUrl: process.env.NEXT_PUBLIC_PICHER_BASE_URL || '',
  },
} as const;

/**
 * API configuration helper
 */
export const getApiConfig = () => {
  const { baseUrl, pictureBaseUrl } = config.api;
  
  // Use relative URLs in browser for client-side requests
  if (typeof window !== 'undefined') {
    return {
      apiUrl: baseUrl || '/api',
      fileUrl: pictureBaseUrl || '',
    };
  }
  
  // Use absolute URLs for server-side requests
  const apiUrl = baseUrl || 'https://www.dohsaving.com/api';
  const fileUrl = pictureBaseUrl || 'https://www.dohsaving.com';
  
  return {
    apiUrl,
    fileUrl,
  };
};