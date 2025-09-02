/**
 * Integration Tests for Security Endpoints
 * Tests CSP reporting and security middleware functionality
 */

import { GET, POST } from '@/app/api/security/csp-report/route';
import { 
  createMockRequest, 
  expectSuccessResponse, 
  setupTestEnvironment,
  cleanupTestEnvironment,
  measureApiPerformance
} from '../utils/test-helpers';

// Mock logger to capture security events
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  security: jest.fn(),
  warn: jest.fn(),
};

jest.mock('@/lib/logger', () => ({
  default: mockLogger,
  ...mockLogger
}));

describe('Security API Integration Tests', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    cleanupTestEnvironment();
  });

  describe('CSP Report Endpoint', () => {
    describe('GET /api/security/csp-report', () => {
      it('should return endpoint status information', async () => {
        const request = createMockRequest('/api/security/csp-report', 'GET');
        const response = await GET();

        await expectSuccessResponse(response);
        
        const data = await response.json();
        expect(data.message).toContain('CSP Report endpoint is active');
        expect(data.description).toBeDefined();
        expect(data.timestamp).toBeDefined();
      });

      it('should respond quickly to health checks', async () => {
        const performance = measureApiPerformance();
        const response = await GET();
        performance.expectFast(100); // Should be very fast

        expect(response.status).toBe(200);
      });
    });

    describe('POST /api/security/csp-report', () => {
      it('should accept valid CSP violation reports', async () => {
        const cspReport = {
          'csp-report': {
            'blocked-uri': 'eval',
            'document-uri': 'https://example.com/page',
            'violated-directive': "script-src 'self'",
            'effective-directive': 'script-src',
            'original-policy': "script-src 'self'; report-uri /api/security/csp-report",
            'status-code': 200
          }
        };

        const request = createMockRequest('/api/security/csp-report', 'POST', {
          headers: {
            'Content-Type': 'application/csp-report',
            'User-Agent': 'Mozilla/5.0 Test Browser'
          },
          body: JSON.stringify(cspReport)
        });

        const response = await POST(request);

        expect(response.status).toBe(204); // No Content response for CSP reports
        
        // Verify logging occurred
        expect(console.log).toHaveBeenCalledWith(
          'CSP Violation Report:',
          expect.objectContaining({
            userAgent: 'Mozilla/5.0 Test Browser',
            timestamp: expect.any(String),
            report: cspReport
          })
        );
      });

      it('should handle malformed JSON gracefully', async () => {
        const request = createMockRequest('/api/security/csp-report', 'POST', {
          body: '{ invalid json structure'
        });

        const response = await POST(request);

        expect(response.status).toBe(204); // Should still return success to avoid revealing errors
        
        // Should log the parsing error
        expect(console.warn).toHaveBeenCalledWith(
          'Invalid CSP report JSON:',
          expect.objectContaining({
            body: '{ invalid json structure',
            parseError: expect.any(Error)
          })
        );
      });

      it('should extract client information correctly', async () => {
        const cspReport = {
          'csp-report': {
            'blocked-uri': 'inline',
            'violated-directive': "style-src 'self'"
          }
        };

        const request = createMockRequest('/api/security/csp-report', 'POST', {
          headers: {
            'x-forwarded-for': '192.168.1.100, 10.0.0.1',
            'x-real-ip': '203.0.113.1',
            'user-agent': 'Test Agent/1.0'
          },
          body: JSON.stringify(cspReport)
        });

        const response = await POST(request);
        expect(response.status).toBe(204);

        // Should extract first IP from x-forwarded-for
        expect(console.log).toHaveBeenCalledWith(
          'CSP Violation Report:',
          expect.objectContaining({
            ip: '192.168.1.100',
            userAgent: 'Test Agent/1.0'
          })
        );
      });

      it('should handle empty request body', async () => {
        const request = createMockRequest('/api/security/csp-report', 'POST', {
          body: ''
        });

        const response = await POST(request);
        expect(response.status).toBe(204);

        // Should log with empty body info
        expect(console.warn).toHaveBeenCalledWith(
          'Invalid CSP report JSON:',
          expect.objectContaining({
            body: '',
            parseError: expect.any(Error)
          })
        );
      });

      it('should handle different content types', async () => {
        const cspReport = {
          'csp-report': {
            'blocked-uri': 'https://evil.com/script.js',
            'violated-directive': "script-src 'self'"
          }
        };

        // Test with application/json
        const jsonRequest = createMockRequest('/api/security/csp-report', 'POST', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cspReport)
        });

        const jsonResponse = await POST(jsonRequest);
        expect(jsonResponse.status).toBe(204);

        // Test with application/csp-report
        const cspRequest = createMockRequest('/api/security/csp-report', 'POST', {
          headers: { 'Content-Type': 'application/csp-report' },
          body: JSON.stringify(cspReport)
        });

        const cspResponse = await POST(cspRequest);
        expect(cspResponse.status).toBe(204);
      });

      it('should handle high-frequency CSP reports', async () => {
        const cspReport = {
          'csp-report': {
            'blocked-uri': 'eval',
            'violated-directive': "script-src 'self'"
          }
        };

        const requests = Array.from({ length: 50 }, (_, i) =>
          createMockRequest('/api/security/csp-report', 'POST', {
            headers: { 'x-forwarded-for': `192.168.1.${i % 10}` },
            body: JSON.stringify({
              ...cspReport,
              'csp-report': {
                ...cspReport['csp-report'],
                'document-uri': `https://example.com/page${i}`
              }
            })
          })
        );

        const performance = measureApiPerformance();
        const responses = await Promise.all(requests.map(req => POST(req)));
        performance.expectFast(5000); // Should handle 50 requests within 5 seconds

        // All requests should succeed
        responses.forEach(response => {
          expect(response.status).toBe(204);
        });

        // Should have logged each report
        expect(console.log).toHaveBeenCalledTimes(50);
      });

      it('should never expose internal errors', async () => {
        // Force an internal error by corrupting the request in an unexpected way
        const problematicRequest = createMockRequest('/api/security/csp-report', 'POST', {
          body: JSON.stringify({ 'csp-report': null })
        });

        // Mock console.error to throw (simulating logger failure)
        const originalConsoleError = console.error;
        console.error = jest.fn(() => {
          throw new Error('Logger failed');
        });

        const response = await POST(problematicRequest);

        // Should still return success status even if internal error occurs
        expect(response.status).toBe(204);

        // Restore console.error
        console.error = originalConsoleError;
      });

      it('should handle various CSP violation types', async () => {
        const violationTypes = [
          {
            'blocked-uri': 'eval',
            'violated-directive': "script-src 'self'",
            'effective-directive': 'script-src'
          },
          {
            'blocked-uri': 'inline',
            'violated-directive': "style-src 'self'",
            'effective-directive': 'style-src'
          },
          {
            'blocked-uri': 'https://untrusted.com/image.png',
            'violated-directive': "img-src 'self'",
            'effective-directive': 'img-src'
          },
          {
            'blocked-uri': 'data:text/html,<script>alert(1)</script>',
            'violated-directive': "frame-src 'none'",
            'effective-directive': 'frame-src'
          }
        ];

        for (const violation of violationTypes) {
          const request = createMockRequest('/api/security/csp-report', 'POST', {
            body: JSON.stringify({ 'csp-report': violation })
          });

          const response = await POST(request);
          expect(response.status).toBe(204);
        }

        // Should have logged all violation types
        expect(console.log).toHaveBeenCalledTimes(violationTypes.length);
      });

      it('should handle extremely large CSP reports', async () => {
        const largeCspReport = {
          'csp-report': {
            'blocked-uri': 'data:text/html,' + 'A'.repeat(100000), // Very large data URI
            'violated-directive': "frame-src 'self'",
            'document-uri': 'https://example.com/page-with-large-content'
          }
        };

        const request = createMockRequest('/api/security/csp-report', 'POST', {
          body: JSON.stringify(largeCspReport)
        });

        const performance = measureApiPerformance();
        const response = await POST(request);
        performance.expectFast(2000); // Should handle even large reports reasonably fast

        expect(response.status).toBe(204);
      });
    });

    describe('Security and Error Handling', () => {
      it('should not leak sensitive information in responses', async () => {
        const request = createMockRequest('/api/security/csp-report', 'POST', {
          body: 'completely invalid'
        });

        const response = await POST(request);
        const data = await response.json();

        // Response should not contain internal error details
        expect(data).not.toHaveProperty('stack');
        expect(data).not.toHaveProperty('error');
        expect(JSON.stringify(data)).not.toContain('Error:');
      });

      it('should handle concurrent CSP reports without conflicts', async () => {
        const concurrentReports = Array.from({ length: 20 }, (_, i) => ({
          'csp-report': {
            'blocked-uri': `https://blocked${i}.com`,
            'violated-directive': "script-src 'self'",
            'document-uri': `https://example.com/page${i}`
          }
        }));

        const requests = concurrentReports.map(report =>
          createMockRequest('/api/security/csp-report', 'POST', {
            body: JSON.stringify(report)
          })
        );

        const responses = await Promise.all(requests.map(req => POST(req)));

        // All should succeed without conflicts
        responses.forEach(response => {
          expect(response.status).toBe(204);
        });
      });

      it('should maintain consistent response format', async () => {
        const testCases = [
          { body: '{}' },
          { body: '{"csp-report": {}}' },
          { body: 'invalid json' },
          { body: '' }
        ];

        for (const testCase of testCases) {
          const request = createMockRequest('/api/security/csp-report', 'POST', testCase);
          const response = await POST(request);

          // All should return 204 status
          expect(response.status).toBe(204);

          // All should have consistent response structure
          const data = await response.json();
          expect(data).toHaveProperty('success', true);
        }
      });
    });
  });
});