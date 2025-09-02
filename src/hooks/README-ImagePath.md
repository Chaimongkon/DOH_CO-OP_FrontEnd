# useImagePath Hook

## Overview
The `useImagePath` hook is a comprehensive custom React hook for processing and validating image paths with security features. It handles image URL construction, validation, sanitization, and batch processing for Thai cooperative web applications.

## Key Features
- **Security First**: URL sanitization and validation to prevent XSS attacks
- **Image Extension Validation**: Supports jpg, jpeg, png, gif, webp, avif, svg
- **External & Local URLs**: Handles both external URLs and local file paths
- **Batch Processing**: Process multiple image paths efficiently
- **API Integration**: Direct processing of API response data
- **Fallback Support**: Graceful handling with placeholder images
- **Performance Optimized**: Uses `useMemo` and `useCallback` for optimal re-rendering
- **Comprehensive Logging**: Detailed logging for debugging and monitoring

## Core Functions

### processImage()
Process a single image path with full validation and security checks.

```typescript
const result = processImage('/images/photo.jpg');
// Returns: ProcessedImageResult
// {
//   url: 'https://files.example.com/images/photo.jpg',
//   isValid: true,
//   isExternal: false,
//   originalPath: '/images/photo.jpg'
// }
```

### processApiImagePaths()
Process API responses with multiple image/file paths in one operation.

```typescript
const processed = processApiImagePaths(newsItem, {
  ImagePath: 'imagePath',
  PdfPath: 'pdfPath'
});
// Adds processed URLs as new properties to the object
```

### getSafeImageUrl()
Get a guaranteed-safe image URL with fallback support.

```typescript
const safeUrl = getSafeImageUrl(null, '/images/default.png');
// Returns fallback URL if input is invalid
```

## Usage Examples

### Basic Setup
```typescript
const { processImage, processApiImagePaths, getSafeImageUrl } = useImagePath({
  baseUrl: process.env.NEXT_PUBLIC_PICHER_BASE_URL || '',
  validateExtension: true,
  sanitizeUrl: true,
  enableLogging: true,
  fallbackUrl: '/image/placeholder.png'
});
```

### Component Integration - News Processing
```typescript
// Before: Manual path construction
const processedData = newsItems.map(item => ({
  ...item,
  imagePath: item.ImagePath ? `${URLFile}${item.ImagePath}` : "",
  pdfPath: item.PdfPath ? `${URLFile}${item.PdfPath}` : "",
}));

// After: Using hook
const processedData = newsItems.map(item => 
  processApiImagePaths(item, {
    ImagePath: 'imagePath',
    PdfPath: 'pdfPath'
  })
);
```

### Component Integration - Slides with Validation
```typescript
// Before: Complex manual validation
const processedImagePath = processImagePath(slide.ImagePath, URLFile);
const sanitizedImagePath = processedImagePath ? sanitizeImageUrl(processedImagePath) : null;

if (!sanitizedImagePath) {
  logger.warn('Invalid image path detected');
  return null;
}

if (!isValidImageExtension(sanitizedImagePath)) {
  logger.warn('Invalid image extension');
  return null;
}

// After: Using hook
const processedResult = processImage(slide.ImagePath);

if (!processedResult.isValid || !processedResult.url) {
  // Hook already logged the issue
  return null;
}
```

### Batch Processing
```typescript
const imagePaths = ['/img1.jpg', '/img2.png', null, 'invalid-url'];
const results = processImageBatch(imagePaths);

results.forEach((result, index) => {
  if (result.isValid) {
    console.log(`Image ${index}: ${result.url}`);
  } else {
    console.log(`Image ${index} failed: ${result.error}`);
  }
});
```

## Configuration Options

```typescript
interface ImageProcessingOptions {
  baseUrl: string;                    // Base URL for file serving (required)
  validateExtension?: boolean;        // Check image extensions (default: true)
  sanitizeUrl?: boolean;             // Security URL validation (default: true)
  enableLogging?: boolean;           // Log validation issues (default: true)
  fallbackUrl?: string;              // Fallback for invalid images
  customValidator?: (url: string) => boolean; // Custom validation function
}
```

## Security Features

### URL Sanitization
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`, `file:`
- Validates HTTP/HTTPS URLs
- Handles relative paths safely

### Image Extension Validation
- Whitelist approach: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.svg`
- Prevents execution of non-image files
- Case-insensitive validation

### XSS Prevention
```typescript
// Dangerous input is safely rejected
processImage('javascript:alert("xss")');
// Result: { isValid: false, error: 'URL failed security validation' }
```

## Error Handling

The hook provides comprehensive error handling with detailed error messages:

```typescript
interface ProcessedImageResult {
  url: string | null;           // Final processed URL
  isValid: boolean;            // Whether processing succeeded
  isExternal: boolean;         // Whether it's an external URL
  error?: string;              // Error message if failed
  originalPath: string | null; // Original input for debugging
}
```

Common error types:
- `"Image path is empty or invalid"`
- `"Failed to process image path"`
- `"URL failed security validation"`
- `"Invalid image file extension"`
- `"Custom validation failed"`

## Performance Benefits

### Before useImagePath Hook
```typescript
// Repeated in every component (15-25 lines each)
const processedImagePath = processImagePath(slide.ImagePath, URLFile);
const sanitizedImagePath = processedImagePath ? sanitizeImageUrl(processedImagePath) : null;

if (!sanitizedImagePath) {
  logger.warn('Invalid or unsafe image path detected', {
    slideId: slide.Id,
    originalPath: slide.ImagePath
  });
  return null;
}

if (!isValidImageExtension(sanitizedImagePath)) {
  logger.warn('Invalid image extension detected', {
    slideId: slide.Id,
    imagePath: sanitizedImagePath
  });
  return null;
}
```

### After useImagePath Hook
```typescript
// Single line with comprehensive processing
const processedResult = processImage(slide.ImagePath);

if (!processedResult.isValid || !processedResult.url) {
  return null; // Hook already logged the issue
}
```

## Implementation Details

- **Location**: `src/hooks/useImagePath.ts`
- **Dependencies**: `src/utils/url-validator.ts` utility functions
- **Updated Components**:
  - `src/app/(Home)/News/page.tsx`
  - `src/app/(Home)/NewsAll/page.tsx`
  - `src/app/(Home)/Slides/page.tsx`
- **Test Data**: `src/hooks/__tests__/useImagePath.test.ts`

## Benefits Achieved

| Metric | Before Hook | After Hook | Improvement |
|--------|-------------|-----------|-------------|
| **Code Lines** | 15-25 per component | 1-3 per component | 80-90% reduction |
| **Security Checks** | Manual, inconsistent | Automatic, comprehensive | 100% coverage |
| **Error Handling** | Varies by component | Standardized logging | Consistent debugging |
| **Maintainability** | Scattered logic | Centralized processing | Easy updates |
| **Type Safety** | Partial TypeScript | Full generic support | Complete coverage |

The useImagePath hook successfully transforms scattered, repetitive image processing logic into a secure, efficient, and maintainable solution that handles all image path processing needs across the cooperative web application. 🎯