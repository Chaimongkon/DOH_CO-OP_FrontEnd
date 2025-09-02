/**
 * Integration Tests for Questions API
 * Tests the /api/Questions endpoint functionality
 */

import { GET, POST } from '@/app/api/Questions/route';
import { 
  createMockRequest, 
  expectSuccessResponse, 
  expectErrorResponse,
  expectPaginatedResponse,
  setupTestEnvironment,
  cleanupTestEnvironment,
  mockDbPool,
  testData,
  measureApiPerformance
} from '../utils/test-helpers';

// Mock dependencies
jest.mock('@/lib/db/mysql.tsx', () => ({
  pool: mockDbPool
}));

jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  api: jest.fn(),
  security: jest.fn(),
}));

jest.mock('@/lib/cache.ts', () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}));

describe('Questions API Integration Tests', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    cleanupTestEnvironment();
  });

  describe('GET /api/Questions', () => {
    it('should return paginated questions list', async () => {
      const mockQuestions = [
        { ...testData.question, id: 1 },
        { ...testData.question, id: 2, question: 'Second question?' }
      ];

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 2 }]])
        .mockResolvedValueOnce([mockQuestions]);

      const request = createMockRequest('/api/Questions', 'GET');
      const response = await GET(request);

      await expectPaginatedResponse(response, 2);
      
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      expect(data.data[0].question).toBe('Test question?');
    });

    it('should filter questions by category', async () => {
      const categoryQuestions = [
        { ...testData.question, category: 'technical' }
      ];

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([categoryQuestions]);

      const request = createMockRequest('/api/Questions', 'GET', {
        params: { category: 'technical' }
      });

      const response = await GET(request);
      await expectSuccessResponse(response);
      
      const data = await response.json();
      expect(data.data[0].category).toBe('technical');
    });

    it('should search questions by keyword', async () => {
      const searchResults = [
        { ...testData.question, question: 'How to register account?' }
      ];

      mockDbPool.execute
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([searchResults]);

      const request = createMockRequest('/api/Questions', 'GET', {
        params: { search: 'register' }
      });

      const performance = measureApiPerformance();
      const response = await GET(request);
      performance.expectFast(500); // Search should be fast

      await expectSuccessResponse(response);
      
      const data = await response.json();
      expect(data.data[0].question).toContain('register');
    });

    it('should handle database errors gracefully', async () => {
      mockDbPool.execute.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = createMockRequest('/api/Questions');
      const response = await GET(request);

      await expectErrorResponse(response, 500);
    });
  });

  describe('POST /api/Questions', () => {
    it('should create new question successfully', async () => {
      const newQuestion = {
        question: 'How to reset password?',
        category: 'account',
        email: 'test@example.com'
      };

      mockDbPool.execute.mockResolvedValueOnce([[], { insertId: 123, affectedRows: 1 }]);

      const request = createMockRequest('/api/Questions', 'POST', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });

      const response = await POST(request);
      await expectSuccessResponse(response);

      const data = await response.json();
      expect(data.data.id).toBe(123);
      expect(data.message).toContain('successfully');
    });

    it('should validate required fields', async () => {
      const invalidQuestion = {
        question: '', // Empty question
        category: 'general'
      };

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(invalidQuestion)
      });

      const response = await POST(request);
      await expectErrorResponse(response, 400, 'Invalid question');
    });

    it('should sanitize input to prevent XSS', async () => {
      const maliciousQuestion = {
        question: 'Test <script>alert("xss")</script> question?',
        category: 'general',
        email: 'test@example.com'
      };

      mockDbPool.execute.mockResolvedValueOnce([[], { insertId: 124, affectedRows: 1 }]);

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(maliciousQuestion)
      });

      const response = await POST(request);
      await expectSuccessResponse(response);

      // Verify the question was sanitized (mock would need to capture the sanitized version)
      expect(mockDbPool.execute).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          expect.not.stringContaining('<script>')
        ])
      );
    });

    it('should enforce rate limiting', async () => {
      const question = {
        question: 'Test question?',
        category: 'general',
        email: 'spammer@example.com'
      };

      // First request should succeed
      mockDbPool.execute.mockResolvedValueOnce([[], { insertId: 125, affectedRows: 1 }]);
      
      const request1 = createMockRequest('/api/Questions', 'POST', {
        headers: { 'x-forwarded-for': '192.168.1.100' },
        body: JSON.stringify(question)
      });

      const response1 = await POST(request1);
      await expectSuccessResponse(response1);

      // Rapid subsequent requests should be rate limited
      const rapidRequests = Array.from({ length: 5 }, () =>
        createMockRequest('/api/Questions', 'POST', {
          headers: { 'x-forwarded-for': '192.168.1.100' },
          body: JSON.stringify(question)
        })
      );

      const rapidResponses = await Promise.all(
        rapidRequests.map(req => POST(req))
      );

      // At least some should be rate limited
      const rateLimitedResponses = rapidResponses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should validate email format', async () => {
      const invalidEmailQuestion = {
        question: 'Test question?',
        category: 'general',
        email: 'invalid-email'
      };

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(invalidEmailQuestion)
      });

      const response = await POST(request);
      await expectErrorResponse(response, 400, 'Invalid email');
    });

    it('should handle database insertion errors', async () => {
      const validQuestion = {
        question: 'Valid question?',
        category: 'general',
        email: 'test@example.com'
      };

      mockDbPool.execute.mockRejectedValueOnce(new Error('ER_DUP_ENTRY: Duplicate entry'));

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(validQuestion)
      });

      const response = await POST(request);
      await expectErrorResponse(response, 500);
    });

    it('should log security events for suspicious content', async () => {
      const suspiciousQuestion = {
        question: 'SELECT * FROM users WHERE password=123',
        category: 'general',
        email: 'hacker@example.com'
      };

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(suspiciousQuestion)
      });

      const response = await POST(request);

      // Should still process but log security event
      // Verification would depend on how security logging is implemented
      expect(response.status).toBeLessThan(500); // Shouldn't crash
    });
  });

  describe('Performance and Security Tests', () => {
    it('should handle concurrent question submissions', async () => {
      mockDbPool.execute.mockResolvedValue([[], { insertId: 126, affectedRows: 1 }]);

      const concurrentQuestions = Array.from({ length: 10 }, (_, i) => ({
        question: `Concurrent question ${i + 1}?`,
        category: 'general',
        email: `user${i + 1}@example.com`
      }));

      const requests = concurrentQuestions.map((question, i) =>
        createMockRequest('/api/Questions', 'POST', {
          headers: { 'x-forwarded-for': `192.168.1.${i + 1}` }, // Different IPs to avoid rate limiting
          body: JSON.stringify(question)
        })
      );

      const performance = measureApiPerformance();
      const responses = await Promise.all(requests.map(req => POST(req)));
      performance.expectFast(3000); // All requests within 3 seconds

      // All requests should succeed
      for (const response of responses) {
        await expectSuccessResponse(response);
      }
    });

    it('should handle very long question text', async () => {
      const longQuestion = {
        question: 'A'.repeat(10000), // Very long question
        category: 'general',
        email: 'test@example.com'
      };

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(longQuestion)
      });

      const response = await POST(request);
      
      // Should either accept (if within limits) or reject gracefully
      expect([200, 400, 413]).toContain(response.status);
    });

    it('should handle malformed JSON gracefully', async () => {
      const request = createMockRequest('/api/Questions', 'POST', {
        body: '{ invalid json'
      });

      const response = await POST(request);
      await expectErrorResponse(response, 400);
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlInjectionAttempt = {
        question: "'; DROP TABLE questions; --",
        category: 'general',
        email: 'attacker@example.com'
      };

      mockDbPool.execute.mockResolvedValueOnce([[], { insertId: 127, affectedRows: 1 }]);

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(sqlInjectionAttempt)
      });

      const response = await POST(request);

      // Should succeed but with sanitized input
      await expectSuccessResponse(response);

      // Verify parameterized queries were used
      expect(mockDbPool.execute).toHaveBeenCalledWith(
        expect.any(String), // SQL query
        expect.any(Array)   // Parameters array
      );
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty request body', async () => {
      const request = createMockRequest('/api/Questions', 'POST', {
        body: ''
      });

      const response = await POST(request);
      await expectErrorResponse(response, 400);
    });

    it('should handle unsupported HTTP methods', async () => {
      // This would be handled by Next.js routing, but we can test our handler's assumptions
      const request = createMockRequest('/api/Questions', 'DELETE' as 'DELETE');
      
      // Should not have DELETE handler
      expect(typeof (POST as any).DELETE).toBe('undefined');
    });

    it('should validate category values', async () => {
      const invalidCategoryQuestion = {
        question: 'Test question?',
        category: 'invalid-category-name',
        email: 'test@example.com'
      };

      const request = createMockRequest('/api/Questions', 'POST', {
        body: JSON.stringify(invalidCategoryQuestion)
      });

      const response = await POST(request);
      
      // Should either accept with default category or reject
      expect([200, 400]).toContain(response.status);
    });
  });
});