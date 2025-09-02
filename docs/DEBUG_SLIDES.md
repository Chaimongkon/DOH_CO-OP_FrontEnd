# Debug Guide สำหรับ Slides

## ปัญหาที่แก้ไขแล้ว:

### 1. API Response Format ไม่ตรงกัน
- **ปัญหา**: API ส่ง `{ success: true, data: [], message: "..." }` แต่ Frontend expect array โดยตรง
- **การแก้ไข**: อัปเดต Frontend ให้รองรับ `ApiSuccessResponse<T>` format

### 2. Environment Variables ไม่ครบ
- **ปัญหา**: ขาด `NEXT_PUBLIC_PICHER_BASE_URL` และ `NEXT_PUBLIC_URL_BASE_DIR`
- **การแก้ไข**: เพิ่มใน `.env.local.example`

### 3. API URL Path ไม่ถูกต้อง  
- **ปัญหา**: เรียก `/Slides` แทน `/api/(Home)/Slides`
- **การแก้ไข**: อัปเดต API base URL เป็น `http://localhost:3000/api`

### 4. File Serving Configuration
- **ปัญหา**: File handler ใช้เฉพาะ `NEXT_PUBLIC_URL_BASE_DIR`
- **การแก้ไข**: เพิ่ม fallback เป็น `FILE_UPLOAD_BASE_DIR`

## การตั้งค่า Environment Variables

### Required Variables:
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_PICHER_BASE_URL=http://localhost:3000

# File Serving (choose one)
NEXT_PUBLIC_URL_BASE_DIR=C:/path/to/uploads
# หรือ
FILE_UPLOAD_BASE_DIR=C:/path/to/uploads

# Database
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=webcoop_db
```

## การทดสอบ Slides API

### 1. ทดสอบ API Endpoint
```bash
curl -X GET "http://localhost:3000/api/(Home)/Slides" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "Id": 1,
      "No": 1,
      "ImagePath": "/Slides/File/slide1.jpg",
      "URLLink": "https://example.com"
    }
  ],
  "timestamp": "2025-01-14T...",
  "message": "Slides retrieved successfully"
}
```

### 2. ทดสอบ File Serving
```bash
curl -X GET "http://localhost:3000/api/(Home)/Slides/File/slide1.jpg" \
  -H "Accept: image/*"
```

### 3. ทดสอบ Database Connection
```sql
SELECT Id, No, ImagePath, URLLink FROM slides ORDER BY No ASC;
```

## การแก้ไข Error ทั่วไป

### Error: "Environment variables not configured"
```bash
# ตรวจสอบไฟล์ .env.local
echo $NEXT_PUBLIC_API_BASE_URL
echo $NEXT_PUBLIC_PICHER_BASE_URL
```

### Error: "Failed to fetch slides: 500"
```bash
# ตรวจสอบ database connection
npm run dev
# ดู console logs สำหรับ database errors
```

### Error: "File serving not configured"
```bash
# ตั้งค่า file serving directory
export NEXT_PUBLIC_URL_BASE_DIR="/path/to/uploads"
# หรือใส่ใน .env.local
```

### Error: "Invalid API response format"
```bash
# ตรวจสอบ API response structure
curl -v "http://localhost:3000/api/(Home)/Slides"
```

## Image Loading Issues

### 1. Broken Image Paths
- ตรวจสอบว่า `ImagePath` ใน database ถูกต้อง
- ตรวจสอบว่าไฟล์รูปภาพมีอยู่จริงใน filesystem

### 2. CORS Issues
- ตรวจสอบ `next.config.mjs` สำหรับ CORS settings
- ตรวจสอบ image domains ใน `next.config.mjs`

### 3. File Permission Issues
- ตรวจสอบ file permissions สำหรับ upload directory
- Windows: ตรวจสอบ UAC และ folder permissions

## Performance Optimization

### 1. Image Optimization
- ใช้ Next.js Image component (✅ ใช้แล้ว)
- ตั้งค่า `priority={index === 0}` สำหรับ first slide (✅ ตั้งแล้ว)
- ใช้ `placeholder="blur"` (✅ ใช้แล้ว)

### 2. Caching
- API cache: 30 minutes (✅ ตั้งแล้ว)
- File cache: 48 hours (✅ ตั้งแล้ว)

### 3. Error Handling
- Comprehensive error logging (✅ เพิ่มแล้ว)
- Graceful fallbacks (✅ เพิ่มแล้ว)

## Logging and Monitoring

### การดู Logs
```bash
# Development
npm run dev
# ดู browser console และ terminal logs

# Production
# ตรวจสอบ Sentry dashboard (หากติดตั้งแล้ว)
```

### สำคัญ: Log Messages
```javascript
// Success
"Slides loaded successfully", { totalSlides: 5, validSlides: 5 }

// Error  
"Failed to fetch slides: 404 Not Found"
"Failed to load slide image: /Slides/File/missing.jpg"
```

## Database Schema

### Table: slides
```sql
CREATE TABLE slides (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  No INT NOT NULL,
  ImagePath VARCHAR(500),
  URLLink VARCHAR(500),
  IsActive BOOLEAN DEFAULT TRUE,
  CreateDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Data:
```sql
INSERT INTO slides (No, ImagePath, URLLink) VALUES 
(1, 'slide1.jpg', 'https://example.com/link1'),
(2, 'slide2.png', 'https://example.com/link2');
```

## Frontend Component Flow

### 1. Component Mount
```javascript
useEffect(() => {
  loadData(); // fetchSlides() + fetchStatus()
}, []);
```

### 2. Data Processing
```javascript
// API Response -> Frontend Format
{
  Id: 1, No: 1, ImagePath: "/Slides/File/slide1.jpg", URLLink: "..."
} 
↓
{
  id: 1, no: 1, imagePath: "http://localhost:3000/Slides/File/slide1.jpg", url: "..."
}
```

### 3. Image Rendering
```javascript
// Swiper + Next.js Image + Error Handling
<Image 
  src={slide.imagePath}
  onError={handleImageError}
  onLoad={handleImageLoad}
/>
```

## Troubleshooting Checklist

- [ ] Database connection ทำงานได้
- [ ] Environment variables ตั้งค่าถูกต้อง
- [ ] Upload directory มีอยู่และมี permissions
- [ ] Slides API ส่ง response ถูกต้อง
- [ ] File serving API ทำงานได้
- [ ] Images มีอยู่ใน filesystem
- [ ] Frontend component load ข้อมูลได้
- [ ] Error handling ทำงานถูกต้อง
- [ ] Logging แสดง information ครบถ้วน

## Next Steps

หากยังมีปัญหา ให้ตรวจสอบ:
1. Browser console errors
2. Network tab ใน DevTools
3. Server logs ใน terminal  
4. Database query results
5. File system permissions