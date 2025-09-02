# API Migration Guide

## Overview
The API structure has been improved for better organization, security, and maintainability while maintaining backward compatibility.

## Changes Made

### 1. Route Group Corrections
- **Fixed**: `(Abonut)` → `(About)`
- **Impact**: None - internal organization only

### 2. Election Endpoints Consolidation
- **Before**: `/api/Election`, `/api/ElectionDepartment`, `/api/ElectionVideos`
- **After**: `/api/(Elections)/Candidates`, `/api/(Elections)/Departments`, `/api/(Elections)/Videos`

#### Migration:
```javascript
// OLD
fetch('/api/Election')
fetch('/api/ElectionDepartment')  
fetch('/api/ElectionVideos')

// NEW (recommended)
fetch('/api/(Elections)/Candidates')
fetch('/api/(Elections)/Departments')
fetch('/api/(Elections)/Videos')
```

### 3. News/Photos Query Parameters
- **Before**: Separate `/api/(Home)/NewsAll` and `/api/(Home)/PhotoAll` endpoints
- **After**: Single endpoints with `?all=true` parameter

#### Migration:
```javascript
// OLD
fetch('/api/(Home)/NewsAll')
fetch('/api/(Home)/PhotoAll')

// NEW (recommended)
fetch('/api/(Home)/News?all=true')
fetch('/api/(Home)/Photos?all=true')

// Pagination still works
fetch('/api/(Home)/News?page=1&per_page=10')
fetch('/api/(Home)/Photos?page=1&per_page=10')
```

### 4. Centralized File Serving
- **All file requests** now go through `/api/files/{category}/File/{path}`
- **Better security**: Rate limiting, file type validation, path traversal protection
- **Better logging**: All file access is logged

#### File serving remains the same for frontend:
```javascript
// These URLs still work exactly the same
'/News/File/image.jpg'
'/PhotoAlbum/File/photo.jpg'
'/BusinessReport/File/report.pdf'
```

## Backward Compatibility

### ✅ Still Work (No Changes Needed)
- All existing file URLs continue to work
- All existing API endpoints still function
- All frontend code continues to work without modification

### ⚠️ Deprecated (Will be removed in future)
- `/api/Election` → Use `/api/(Elections)/Candidates`
- `/api/ElectionDepartment` → Use `/api/(Elections)/Departments`
- `/api/ElectionVideos` → Use `/api/(Elections)/Videos`
- `/api/(Home)/NewsAll` → Use `/api/(Home)/News?all=true`
- `/api/(Home)/PhotoAll` → Use `/api/(Home)/Photos?all=true`

## Benefits of New Structure

### Security Improvements
- ✅ Centralized file serving with rate limiting (1000 req/min per IP)
- ✅ File type validation for each category
- ✅ Path traversal protection
- ✅ File size limits per category
- ✅ Comprehensive logging of all file access

### Performance Improvements  
- ✅ Proper HTTP caching headers for files
- ✅ Reduced code duplication (15+ duplicate file handlers → 1)
- ✅ Simplified middleware (20+ rewrites → 16 centralized rewrites)

### Maintainability Improvements
- ✅ Logical route grouping
- ✅ Consistent naming conventions
- ✅ Single point for file serving logic
- ✅ Better error handling and logging

## Testing Checklist

### API Endpoints
- [ ] `/api/StatusHome` - Website status
- [ ] `/api/(Home)/News` - News with pagination
- [ ] `/api/(Home)/News?all=true` - All news
- [ ] `/api/(Home)/Photos` - Photos with pagination  
- [ ] `/api/(Home)/Photos?all=true` - All photos
- [ ] `/api/(Home)/Photos/[id]` - Individual photo album
- [ ] `/api/(Elections)/Candidates` - Election candidates
- [ ] `/api/(Elections)/Departments` - Election departments
- [ ] `/api/(Elections)/Videos` - Election videos
- [ ] `/api/(About)/Organizational` - Organization structure
- [ ] `/api/(About)/SocietyCoop` - Cooperative society info
- [ ] `/api/(About)/Vision` - Vision and mission
- [ ] `/api/Questions` - Q&A system
- [ ] `/api/Complaint` - Complaint system

### File Serving
- [ ] `/News/File/image.jpg` - News images
- [ ] `/PhotoAlbum/File/photo.jpg` - Photo album images
- [ ] `/BusinessReport/File/report.pdf` - Business reports
- [ ] `/Application/File/form.pdf` - Application forms
- [ ] `/ElectionDepartment/File/doc.pdf` - Election documents

### Security Features
- [ ] Rate limiting works (429 status after limits exceeded)
- [ ] File type validation (403 for disallowed types)
- [ ] Path traversal protection (400 for ../.. attempts)
- [ ] File size limits (413 for oversized files)
- [ ] Proper error logging

## Migration Timeline

### Phase 1: Current (Completed)
- ✅ All improvements implemented
- ✅ Backward compatibility maintained
- ✅ New endpoints available

### Phase 2: Transition Period (6 months)
- Continue supporting old endpoints
- Update documentation to use new endpoints
- Monitor usage of deprecated endpoints

### Phase 3: Cleanup (Future)
- Remove deprecated endpoints
- Update any remaining references
- Final performance optimizations

## Support

If you encounter any issues with the new API structure:
1. Check this migration guide first
2. Verify the endpoint exists and is correctly formatted
3. Check browser console for error messages
4. Review server logs for detailed error information

All existing functionality remains exactly the same from the frontend perspective.