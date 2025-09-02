/**
 * URL Validation Utilities
 * Helper functions for validating and processing URLs
 */

/**
 * Check if a string is a valid HTTP/HTTPS URL
 * @param str - String to validate
 * @returns boolean indicating if string is a valid URL
 */
export function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Check if a string is an external URL (starts with http:// or https://)
 * @param str - String to check
 * @returns boolean indicating if string is external URL
 */
export function isExternalUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://');
}

/**
 * Process image path - handle both local files and external URLs
 * @param imagePath - Raw image path from database
 * @param baseUrl - Base URL for local files
 * @returns Processed image URL
 */
export function processImagePath(imagePath: string | null, baseUrl: string): string | null {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  const trimmedPath = imagePath.trim();

  // If it's already an external URL, return as-is
  if (isExternalUrl(trimmedPath)) {
    return isValidUrl(trimmedPath) ? trimmedPath : null;
  }

  // If it's already a processed local path, combine with base URL
  if (trimmedPath.startsWith('/')) {
    return `${baseUrl}${trimmedPath}`;
  }

  // Process as filename only
  return `${baseUrl}/Slides/File/${trimmedPath}`;
}

/**
 * Validate image file extension
 * @param url - Image URL or path
 * @returns boolean indicating if extension is valid
 */
export function isValidImageExtension(url: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.pdf', '.doc', '.docx'];
  
  try {
    const urlObj = new URL(url, 'http://localhost'); // Add base for relative URLs
    const pathname = urlObj.pathname.toLowerCase();
    
    return validExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    // If URL parsing fails, check the string directly
    const lowerUrl = url.toLowerCase();
    return validExtensions.some(ext => lowerUrl.endsWith(ext));
  }
}

/**
 * Get domain from URL
 * @param url - URL string
 * @returns Domain name or null if invalid
 */
export function getDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is from a trusted domain
 * @param url - URL to check
 * @param trustedDomains - Array of trusted domain names
 * @returns boolean indicating if domain is trusted
 */
export function isTrustedDomain(url: string, trustedDomains: string[]): boolean {
  const domain = getDomainFromUrl(url);
  if (!domain) return false;

  return trustedDomains.some(trustedDomain => {
    // Exact match
    if (domain === trustedDomain) return true;
    
    // Subdomain match (e.g., subdomain.example.com matches example.com)
    if (domain.endsWith(`.${trustedDomain}`)) return true;
    
    return false;
  });
}

/**
 * Sanitize URL for safe usage
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if unsafe
 */
export function sanitizeImageUrl(url: string): string | null {
  if (!url || url.trim() === '') return null;

  const trimmedUrl = url.trim();

  // Block potentially dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmedUrl.toLowerCase();
  
  if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
    return null;
  }

  // Allow only HTTP, HTTPS, and relative URLs
  if (!isExternalUrl(trimmedUrl) && !trimmedUrl.startsWith('/')) {
    return trimmedUrl; // Relative path
  }

  if (isExternalUrl(trimmedUrl)) {
    return isValidUrl(trimmedUrl) ? trimmedUrl : null;
  }

  return trimmedUrl;
}