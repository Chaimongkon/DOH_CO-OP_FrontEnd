// Test data for useImagePath hook

export const testImagePaths = {
  // Valid image paths
  validLocalPath: '/images/photo1.jpg',
  validExternalUrl: 'https://example.com/image.png',
  validRelativePath: 'photo.jpeg',
  
  // Invalid paths
  invalidExtension: '/images/document.pdf',
  emptyPath: '',
  nullPath: null,
  undefinedPath: undefined,
  dangerousUrl: 'javascript:alert("xss")',
  
  // API response structure
  apiNewsItem: {
    Id: 1,
    Title: 'Test News',
    ImagePath: '/news/image1.jpg',
    PdfPath: '/news/document1.pdf',
    CreateDate: '2024-01-15'
  },
  
  // Slides API response
  apiSlideItem: {
    Id: 1,
    No: 1,
    ImagePath: 'slide1.png',
    URLLink: 'https://example.com'
  }
};

export const expectedResults = {
  // Expected processed results
  validLocalProcessed: 'https://files.example.com/images/photo1.jpg',
  validExternalProcessed: 'https://example.com/image.png',
  validRelativeProcessed: 'https://files.example.com/Slides/File/photo.jpeg',
  
  // Expected API processing results
  processedNewsItem: {
    Id: 1,
    Title: 'Test News',
    CreateDate: '2024-01-15',
    ImagePath: '/news/image1.jpg',
    PdfPath: '/news/document1.pdf',
    imagePath: 'https://files.example.com/news/image1.jpg',
    pdfPath: 'https://files.example.com/news/document1.pdf'
  }
};

export const mockOptions = {
  baseUrl: 'https://files.example.com',
  validateExtension: true,
  sanitizeUrl: true,
  enableLogging: true,
  fallbackUrl: '/image/placeholder.png'
};

// This file serves as test data for the useImagePath hook
// In a full test environment, you would add actual unit tests here using Jest/React Testing Library

// Example usage patterns that should work:
/*
const { processImage, processApiImagePaths, getSafeImageUrl } = useImagePath({
  baseUrl: 'https://files.example.com',
  validateExtension: true,
  sanitizeUrl: true,
  enableLogging: true
});

// Basic image processing
const result = processImage('/images/photo.jpg');
// result.url => 'https://files.example.com/images/photo.jpg'
// result.isValid => true

// Process invalid image
const invalidResult = processImage('javascript:alert("xss")');
// invalidResult.url => '/image/placeholder.png' (fallback)
// invalidResult.isValid => false
// invalidResult.error => 'URL failed security validation'

// Batch processing
const batchResults = processImageBatch([
  '/images/photo1.jpg',
  '/images/photo2.png',
  null
]);
// Returns array of ProcessedImageResult objects

// API data processing
const processedNewsData = processApiImagePaths(apiNewsItem, {
  ImagePath: 'imagePath',
  PdfPath: 'pdfPath'
});
// Adds 'imagePath' and 'pdfPath' properties with processed URLs

// Safe URL with fallback
const safeUrl = getSafeImageUrl(null, '/image/default.png');
// Returns '/image/default.png' since input is null

// Validation utilities
const isValid = validateImageUrl('https://example.com/photo.jpg'); // true
const isExternal = isExternalImage('https://example.com/photo.jpg'); // true
*/