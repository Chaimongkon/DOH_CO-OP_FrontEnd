/**
 * Test Helper Utilities
 * Shared utilities for testing API endpoints and components
 */

import { NextRequest } from 'next/server';

// Mock database pool for testing
export const mockDbPool = {
  getConnection: jest.fn(),
  execute: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
};

// Mock Redis client for testing
export const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  disconnect: jest.fn(),
};

// Create mock Next.js request
export function createMockRequest(
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: {
    headers?: Record<string, string>;
    body?: string;
    params?: Record<string, string>;
  } = {}
): NextRequest {
  const { headers = {}, body, params = {} } = options;

  // Create URL with query parameters
  const mockUrl = new URL(url, process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.dohsaving.com');
  Object.entries(params).forEach(([key, value]) => {
    mockUrl.searchParams.set(key, value);
  });

  // Create mock request
  const request = new NextRequest(mockUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'jest-test-agent',
      ...headers
    },
    ...(body && { body })
  });

  return request;
}

// Database test data generators
export const testData = {
  news: {
    id: 1,
    title: 'Test News Title',
    content: 'Test news content',
    image: 'test-image.jpg',
    date_posted: new Date().toISOString(),
    views: 100,
    status: 'active'
  },
  
  question: {
    id: 1,
    question: 'Test question?',
    category: 'general',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  answer: {
    id: 1,
    question_id: 1,
    answer: 'Test answer',
    created_at: new Date().toISOString(),
    is_official: true
  }
};

// Mock successful database responses
export const mockDbResponses = {
  news: [
    [testData.news],
    { insertId: 1, affectedRows: 1 }
  ],
  
  questions: [
    [testData.question],
    { insertId: 1, affectedRows: 1 }
  ],

  empty: [[], { affectedRows: 0 }],
  
  count: [[{ total: 10 }]],
};

// Mock error scenarios
export const mockDbErrors = {
  connectionError: new Error('ECONNREFUSED: Connection refused'),
  timeoutError: new Error('ETIMEDOUT: Operation timed out'),
  sqlError: new Error('ER_BAD_FIELD_ERROR: Unknown column'),
  genericError: new Error('Unexpected database error')
};

// Test response helpers
export function expectSuccessResponse(response: Response, expectedData?: any) {
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('application/json');
  
  return response.json().then(data => {
    expect(data.success).toBe(true);
    expect(data.timestamp).toBeDefined();
    if (expectedData) {
      expect(data.data).toEqual(expect.objectContaining(expectedData));
    }
    return data;
  });
}

export function expectErrorResponse(response: Response, expectedStatus = 500, expectedMessage?: string) {
  expect(response.status).toBe(expectedStatus);
  expect(response.headers.get('content-type')).toContain('application/json');
  
  return response.json().then(data => {
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.timestamp).toBeDefined();
    if (expectedMessage) {
      expect(data.error).toContain(expectedMessage);
    }
    return data;
  });
}

export function expectPaginatedResponse(response: Response, expectedTotal?: number) {
  expect(response.status).toBe(200);
  
  return response.json().then(data => {
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.pagination).toBeDefined();
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('per_page');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('pageCount');
    expect(data.pagination).toHaveProperty('hasNext');
    expect(data.pagination).toHaveProperty('hasPrev');
    
    if (expectedTotal !== undefined) {
      expect(data.pagination.total).toBe(expectedTotal);
    }
    
    return data;
  });
}

// Environment setup for tests
export function setupTestEnvironment() {
  // Set test environment variables
  (process.env as any).NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.dohsaving.com/api';
  process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_db';
  
  // Suppress console logs in tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
}

// Cleanup after tests
export function cleanupTestEnvironment() {
  jest.restoreAllMocks();
  jest.clearAllMocks();
}

// Performance testing utilities
export function measureApiPerformance() {
  const start = Date.now();
  
  return {
    end: () => Date.now() - start,
    expectFast: (maxMs = 1000) => {
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(maxMs);
      return duration;
    }
  };
}