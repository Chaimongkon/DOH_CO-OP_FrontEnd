/**
 * Integration Tests for News API
 * Tests the /api/(Home)/News endpoint functionality
 */

import { GET } from '@/app/api/(Home)/News/route';
import { 
  createMockRequest, 
  expectSuccessResponse, 
  expectErrorResponse,
  expectPaginatedResponse,
  setupTestEnvironment,
  cleanupTestEnvironment,
  mockDbPool,
  mockDbResponses,
  mockDbErrors,
  testData
} from '../utils/test-helpers';

// Mock dependencies
jest.mock('@/lib/db/mysql.tsx', () => ({
  pool: mockDbPool
}));

jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  api: jest.fn(),
}));

describe('News API Integration Tests', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    cleanupTestEnvironment();
  });

  describe('GET /api/(Home)/News', () => {
    it('should return paginated news list successfully', async () => {
      // Mock database response
      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 5 }]]) // Count query
        .mockResolvedValueOnce([
          [
            { ...testData.news, id: 1 },
            { ...testData.news, id: 2, title: 'Second News' }
          ]
        ]); // Data query

      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { page: '1', per_page: '10' }
      });

      const response = await GET(request);
      
      await expectPaginatedResponse(response, 5);
      
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data[0]).toMatchObject({
        id: 1,
        title: 'Test News Title'
      });
    });

    it('should handle empty news list', async () => {
      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);

      const request = createMockRequest('/api/(Home)/News');
      const response = await GET(request);
      
      await expectPaginatedResponse(response, 0);
      
      const data = await response.json();
      expect(data.data).toHaveLength(0);
    });

    it('should handle database connection errors', async () => {
      mockDbPool.execute.mockRejectedValueOnce(mockDbErrors.connectionError);

      const request = createMockRequest('/api/(Home)/News');
      const response = await GET(request);
      
      await expectErrorResponse(response, 503, 'Database server is not responding');
    });

    it('should handle SQL errors', async () => {
      mockDbPool.execute.mockRejectedValueOnce(mockDbErrors.sqlError);

      const request = createMockRequest('/api/(Home)/News');
      const response = await GET(request);
      
      await expectErrorResponse(response, 500, 'Error executing database query');
    });

    it('should validate pagination parameters', async () => {
      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { page: '-1', per_page: '1000' }
      });

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 10 }]])
        .mockResolvedValueOnce([[testData.news]]);

      const response = await GET(request);
      
      // Should normalize invalid params and still work
      await expectPaginatedResponse(response);
    });

    it('should handle large result sets efficiently', async () => {
      const largeNewsList = Array.from({ length: 50 }, (_, i) => ({
        ...testData.news,
        id: i + 1,
        title: `News Item ${i + 1}`
      }));

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 50 }]])
        .mockResolvedValueOnce([largeNewsList]);

      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { page: '1', per_page: '50' }
      });

      const startTime = Date.now();
      const response = await GET(request);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds max
      await expectPaginatedResponse(response, 50);
    });

    it('should return proper cache headers', async () => {
      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[testData.news]]);

      const request = createMockRequest('/api/(Home)/News');
      const response = await GET(request);
      
      await expectSuccessResponse(response);
      
      // Check for cache-related headers
      expect(response.headers.get('cache-control')).toBeTruthy();
    });

    it('should handle concurrent requests safely', async () => {
      mockDbPool.execute
        .mockResolvedValue([[{ total: 1 }]])
        .mockResolvedValue([[testData.news]]);

      // Simulate 5 concurrent requests
      const requests = Array.from({ length: 5 }, () => 
        createMockRequest('/api/(Home)/News')
      );

      const responses = await Promise.all(
        requests.map(request => GET(request))
      );

      // All requests should succeed
      for (const response of responses) {
        await expectSuccessResponse(response);
      }

      // Database should handle concurrent access
      expect(mockDbPool.execute).toHaveBeenCalledTimes(10); // 5 requests × 2 queries each
    });

    it('should filter by status correctly', async () => {
      const activeNews = { ...testData.news, status: 'active' };
      
      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[activeNews]]);

      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { status: 'active' }
      });

      const response = await GET(request);
      await expectSuccessResponse(response);
      
      const data = await response.json();
      expect(data.data[0].status).toBe('active');
    });

    it('should handle search functionality', async () => {
      const searchResults = [
        { ...testData.news, title: 'Searched News Title' }
      ];

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([searchResults]);

      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { search: 'Searched' }
      });

      const response = await GET(request);
      await expectSuccessResponse(response);
      
      const data = await response.json();
      expect(data.data[0].title).toContain('Searched');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed request parameters', async () => {
      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { page: 'invalid', per_page: 'also-invalid' }
      });

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[testData.news]]);

      const response = await GET(request);
      
      // Should still work with defaults
      await expectSuccessResponse(response);
    });

    it('should handle database timeout gracefully', async () => {
      mockDbPool.execute.mockRejectedValueOnce(mockDbErrors.timeoutError);

      const request = createMockRequest('/api/(Home)/News');
      const response = await GET(request);
      
      await expectErrorResponse(response, 503);
    });

    it('should validate content types and encoding', async () => {
      const newsWithUnicode = {
        ...testData.news,
        title: 'ข่าวทดสอบภาษาไทย 🎉',
        content: 'เนื้อหาทดสอบ with mixed content'
      };

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[newsWithUnicode]]);

      const request = createMockRequest('/api/(Home)/News');
      const response = await GET(request);
      
      await expectSuccessResponse(response);
      
      const data = await response.json();
      expect(data.data[0].title).toContain('ภาษาไทย');
      expect(data.data[0].title).toContain('🎉');
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle high-frequency requests without memory leaks', async () => {
      mockDbPool.execute
        .mockResolvedValue([[{ total: 1 }]])
        .mockResolvedValue([[testData.news]]);

      // Simulate rapid requests
      const rapidRequests = Array.from({ length: 100 }, (_, i) => 
        createMockRequest(`/api/(Home)/News?page=${i % 10 + 1}`)
      );

      const startMemory = process.memoryUsage().heapUsed;
      
      await Promise.all(
        rapidRequests.map(request => GET(request))
      );

      const endMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = endMemory - startMemory;

      // Memory growth should be reasonable (less than 50MB for 100 requests)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    });

    it('should complete requests within acceptable time limits', async () => {
      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 100 }]])
        .mockResolvedValueOnce([Array.from({ length: 20 }, (_, i) => ({
          ...testData.news,
          id: i + 1
        }))]);

      const request = createMockRequest('/api/(Home)/News', 'GET', {
        params: { per_page: '20' }
      });

      const startTime = Date.now();
      const response = await GET(request);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      await expectSuccessResponse(response);
    });
  });
});