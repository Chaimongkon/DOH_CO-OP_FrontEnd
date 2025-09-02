# Integration Testing Guide

## Overview

This project includes comprehensive integration testing infrastructure for API endpoints and security features. The testing setup uses Jest with TypeScript support and includes mock utilities for database and external services.

## Test Structure

### 📁 Test Organization
```
__tests__/
├── api/                    # API integration tests
│   ├── basic.test.ts      # Basic API validation tests
│   ├── news.test.ts       # News API endpoint tests
│   ├── questions.test.ts  # Questions API endpoint tests
│   └── security.test.ts   # Security/CSP endpoint tests
├── components/            # Component tests (future)
└── utils/
    └── test-helpers.ts    # Shared testing utilities
```

## Available Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only API tests
npm run test:api

# Run only component tests
npm run test:components

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## Test Categories

### 1. Basic Integration Tests (`basic.test.ts`)

**Purpose**: Validate core API functionality without complex imports

**Test Areas**:
- Environment configuration
- API response structure validation
- Data validation patterns
- Utility functions
- Performance validation
- Error handling
- Security validation

**Key Features**:
- ✅ No external dependencies
- ✅ Fast execution
- ✅ Validates response formats
- ✅ Tests pagination logic
- ✅ Email validation
- ✅ HTML sanitization
- ✅ Memory usage patterns

### 2. News API Tests (`news.test.ts`)

**Purpose**: Comprehensive testing of the `/api/(Home)/News` endpoint

**Test Coverage**:
- Paginated news retrieval
- Empty result handling
- Database error scenarios
- Performance under load
- Concurrent request handling
- Search functionality
- Status filtering
- Cache headers validation

**Mock Features**:
- Database pool mocking
- Redis cache mocking
- Error scenario simulation
- Performance measurement

### 3. Questions API Tests (`questions.test.ts`)

**Purpose**: Testing the `/api/Questions` endpoint for Q&A functionality

**Test Coverage**:
- GET requests (list questions)
- POST requests (create questions)
- Input validation and sanitization
- Rate limiting
- SQL injection prevention
- XSS protection
- Concurrent submissions
- Email validation
- Category validation

**Security Features**:
- Input sanitization validation
- Rate limiting verification
- SQL injection attempt detection
- Security event logging

### 4. Security Tests (`security.test.ts`)

**Purpose**: Testing CSP reporting and security middleware

**Test Coverage**:
- CSP violation report handling
- GET endpoint health checks
- POST report processing
- Malformed JSON handling
- Client information extraction
- High-frequency report handling
- Error concealment (security)
- Various violation types

**Security Validation**:
- Never exposes internal errors
- Consistent response formats
- Proper logging of security events
- Handle various CSP violation scenarios

## Test Utilities

### Test Helpers (`test-helpers.ts`)

**Core Functions**:

```typescript
// Create mock Next.js requests
createMockRequest(url, method, options)

// Response validation helpers
expectSuccessResponse(response, expectedData)
expectErrorResponse(response, expectedStatus, expectedMessage)
expectPaginatedResponse(response, expectedTotal)

// Performance measurement
measureApiPerformance()

// Environment setup
setupTestEnvironment()
cleanupTestEnvironment()
```

**Mock Data**:
- Database responses
- Error scenarios
- Test data generators
- Common API structures

## Sentry Integration Testing

### Sentry Configuration Files

**Client-side** (`sentry.client.config.ts`):
- Performance monitoring
- Session replay
- Error filtering for development
- Hydration error filtering

**Server-side** (`sentry.server.config.ts`):
- Database monitoring
- HTTP request tracing
- Server error logging
- Development error filtering

**Edge Runtime** (`sentry.edge.config.ts`):
- Minimal configuration for edge functions
- Edge runtime error handling

### Logger Integration

The logger now includes Sentry integration:
- Automatic error capture
- Context preservation
- Breadcrumb generation
- Severity level mapping
- Component tagging

## Running Tests

### Prerequisites

1. Install test dependencies (already included):
```bash
npm install
```

2. Set up test environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure Sentry (optional):
```bash
# Add to .env.local
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-public-sentry-dsn
```

### Test Execution

**Development Testing**:
```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest __tests__/api/basic.test.ts

# Run with debug output
DEBUG_TESTS=true npm test
```

**Production Validation**:
```bash
# Full test suite with coverage
npm run test:coverage

# CI pipeline tests
npm run test:ci
```

### Performance Testing

Tests include performance validations:
- API response time limits
- Memory usage monitoring
- Concurrent request handling
- Large dataset processing

**Example Performance Assertions**:
```typescript
// Response time validation
performance.expectFast(1000); // < 1 second

// Memory growth validation
expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // < 50MB

// Concurrent processing
expect(duration).toBeLessThan(3000); // 10 requests in < 3 seconds
```

## Test Data and Mocking

### Database Mocking

```typescript
const mockDbPool = {
  execute: jest.fn(),
  query: jest.fn(),
  getConnection: jest.fn(),
  end: jest.fn()
};
```

### Redis Mocking

```typescript
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};
```

### Test Data Generation

Pre-defined test data for consistent testing:
- News items
- Questions and answers
- User data
- Error scenarios

## Security Testing Features

### Input Validation Testing
- SQL injection attempts
- XSS payload testing
- HTML sanitization validation
- Email format validation

### Rate Limiting Testing
- Concurrent request simulation
- IP-based rate limiting
- Abuse prevention validation

### CSP Testing
- Valid CSP report handling
- Malformed report processing
- Client information extraction
- Security event logging

## Troubleshooting

### Common Issues

**Jest Configuration Errors**:
- Ensure TypeScript is properly configured
- Check moduleNameMapper settings
- Verify Next.js integration

**Mock Issues**:
- Clear mocks between tests
- Restore mocks after tests
- Use proper Jest spy functions

**Performance Issues**:
- Increase test timeouts for slow operations
- Use --detectOpenHandles for hanging tests
- Monitor memory usage in tests

### Debug Mode

Enable detailed test logging:
```bash
DEBUG_TESTS=true npm test
```

This provides:
- Detailed console output
- Error stack traces
- Performance metrics
- Memory usage stats

## Best Practices

### Test Organization
1. Group related tests in describe blocks
2. Use descriptive test names
3. Keep tests focused and atomic
4. Use beforeEach/afterEach for cleanup

### Mocking Strategy
1. Mock external dependencies
2. Use real data structures
3. Test error scenarios
4. Validate mock interactions

### Performance Considerations
1. Set appropriate timeouts
2. Monitor memory usage
3. Test concurrent scenarios
4. Validate response times

### Security Testing
1. Test input validation
2. Verify error concealment
3. Check rate limiting
4. Validate sanitization

## Future Enhancements

### Planned Improvements
- [ ] Component testing setup
- [ ] E2E testing with Playwright
- [ ] Visual regression testing
- [ ] API contract testing
- [ ] Load testing integration
- [ ] Continuous performance monitoring

### Integration Opportunities
- GitHub Actions CI/CD
- Automated security scanning
- Performance regression detection
- Test result reporting
- Coverage threshold enforcement

## Conclusion

This comprehensive testing setup provides:
- ✅ **API validation** - All critical endpoints tested
- ✅ **Security testing** - XSS, SQL injection, rate limiting
- ✅ **Performance monitoring** - Response times and memory usage
- ✅ **Error handling** - Comprehensive error scenario coverage
- ✅ **Sentry integration** - Production-ready error monitoring

The testing infrastructure ensures code quality, security, and performance standards are maintained throughout development and deployment.