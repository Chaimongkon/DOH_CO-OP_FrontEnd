# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application for the Department of Highways Saving Cooperative (สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด) website, built with TypeScript, Tailwind CSS, and Ant Design/Material-UI components. The application serves cooperative members with financial services, news, document management, and member features.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture and Structure

### Core Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS + Ant Design + Material-UI (Joy/Material)
- **Database**: MySQL2 with connection pooling
- **Caching**: Redis (IORedis)
- **File Processing**: Sharp for image optimization, Tesseract.js for OCR
- **State Management**: React hooks and context

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/layout/` - Layout components (header, footer, navigation)
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions
- `public/` - Static assets including fonts, images, and uploaded files

### Key Architectural Patterns

**File-based API Routes**: All API endpoints follow Next.js App Router convention in `src/app/api/`

**Database Layer**: MySQL connection pool configured in `src/app/api/db/mysql.tsx` with environment-based configuration

**File Upload System**: Organized under `public/Uploads/` with UUID-based naming:
- `PhotoAlbum/` - Photo galleries
- `Election/Department/` - Election documents
- Categories include Original, Resized versions

**URL Rewriting**: Middleware handles file serving by rewriting `/[category]/File/...` to `/api/[category]/File/...`

**Multi-language Support**: Primary language is Thai with comprehensive SEO meta tags

### Component Organization

**Layout Components**:
- `TopHeader` - Site-wide top navigation
- `Header` - Main navigation with menu items
- `Footer` - Site footer
- `SubHeader` - Secondary navigation

**Feature Components**:
- `ClientSections` - Member-specific content sections
- `CookieConsent` - GDPR compliance
- `VisitsCount` - Site analytics
- Particle systems (`SnowParticles`, `Particles`) for seasonal effects

### State Management Patterns

**Dynamic Feature Flags**: Status-based feature toggling via `/api/StatusHome`
```typescript
// Example: Snow effect control
const [isSnow, setIsSnow] = useState(false);
// Fetches status and enables/disables features based on backend configuration
```

**Environment Configuration**: Uses `NEXT_PUBLIC_API_BASE_URL` for API endpoints

### File Processing Features

**Image Handling**: Sharp for optimization, automatic WebP/AVIF conversion
**OCR Capabilities**: Tesseract.js with Thai language support
**Document Management**: PDF handling, file type validation

### Security Considerations

**Headers**: Comprehensive security headers in `next.config.mjs`
**File Access**: Middleware-controlled file serving
**Database**: Environment-based credentials, connection pooling

## Development Guidelines

### API Route Patterns
- Use dynamic routes with `[...filePath]` for file serving
- Implement proper error handling and HTTP status codes
- **NEW**: Use optimized `DatabasePool` from `src/lib/db/database-pool.ts` for new implementations
- **NEW**: Use `queryHelper` from `src/lib/db/query-helper.ts` for simplified database operations with caching
- Legacy: Database queries can still use the connection pool from `mysql.tsx` (backward compatibility)

### Component Development
- Follow existing component structure with separate CSS modules where needed
- Use TypeScript interfaces defined in `src/types/`
- Implement proper loading states with Skeleton components

### File Management
- Upload files follow UUID naming convention
- Maintain Original/Resized structure for images
- Use middleware for secure file access

### SEO and Performance
- Implement comprehensive meta tags following the pattern in `layout.tsx`
- Use proper semantic HTML with ARIA labels
- Optimize images with Sharp and Next.js Image component

## Database Optimization Features (NEW)

### Query Caching System
- **Location**: `src/lib/db/query-cache.ts`
- **Purpose**: Redis-based query result caching to reduce database load
- **Cache Presets**: SHORT (1min), MEDIUM (5min), LONG (30min), VERY_LONG (1hr), PERMANENT (24hr)
- **Usage**: Automatic with `queryHelper` or manual with `queryCache.get()`/`queryCache.set()`

### Read Replicas Support
- **Location**: `src/lib/db/database-pool.ts`
- **Purpose**: Distribute read operations across multiple database servers
- **Configuration**: Environment variables `DB_REPLICA_1_HOST`, `DB_REPLICA_2_HOST`, etc.
- **Load Balancing**: Round-robin selection for replica connections
- **Automatic Routing**: SELECT queries use replicas, write operations use master

### Database Health Monitoring
- **Location**: `src/lib/db/health-monitor.ts`
- **API Endpoint**: `/api/database/health`
- **Features**: 
  - Real-time health status for master and replica connections
  - Performance metrics and trends analysis
  - Cache hit rate monitoring
  - Automated alerting for performance issues
- **Monitoring**: Continuous background health checks with configurable intervals

### Query Helper Utilities
- **Location**: `src/lib/db/query-helper.ts`
- **Features**:
  - Simplified database operations with built-in caching
  - Automatic retry logic with exponential backoff
  - Pagination support with `selectPaginated()`
  - Batch insert operations with `batchInsert()`
  - Transaction support with connection management
  - Slow query detection and logging

### Migration Guidelines
- **New APIs**: Use `queryHelper` and `DatabasePool` for optimal performance
- **Legacy APIs**: Continue using existing `mysql.tsx` pool (backward compatible)
- **Example**: See `src/app/api/(Home)/News/route-optimized.ts` for migration example
- **Environment Variables**: 
  ```
  DB_CONNECTION_LIMIT=20          # Total connections per pool
  DB_REPLICA_1_HOST=replica1.db   # First read replica
  DB_REPLICA_1_PORT=3306          # Replica port
  REDIS_HOST=127.0.0.1            # Cache server
  REDIS_PORT=6379                 # Cache port
  ```

### Performance Benefits
- **Query Caching**: 60-90% reduction in database load for repeated queries
- **Read Replicas**: Horizontal scaling for read-heavy operations
- **Connection Pooling**: Efficient connection reuse and management
- **Health Monitoring**: Proactive issue detection and performance optimization