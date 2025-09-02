# Lib Types Documentation

## โครงสร้าง Types ที่จัดระเบียบแล้ว

การแยก type definitions ออกมาเป็นไฟล์แยกมีประโยชน์หลายประการ:

### ✅ ข้อดีของการแยก Types

1. **Code Reusability** - ใช้ types ซ้ำได้ในหลายไฟล์
2. **Maintainability** - แก้ไข types ที่จุดเดียว ส่งผลไปทั้งระบบ
3. **Type Safety** - ป้องกัน type mismatch ระหว่างไฟล์
4. **Developer Experience** - IntelliSense และ autocomplete ที่ดีขึ้น
5. **Code Organization** - โครงสร้างโค้ดที่เป็นระเบียบ
6. **Bundle Size** - TypeScript compiler สามารถ optimize ได้ดีขึ้น

### 📁 โครงสร้างไฟล์

```
src/lib/types/
├── index.ts           # Central export point
├── database.ts        # Database-related types
├── security.ts        # Security & validation types
├── logging.ts         # Logging system types
├── cache.ts          # Cache system types
├── performance.ts    # Performance monitoring types
└── README.md         # This documentation
```

### 🎯 Types Categories

#### 1. Database Types (`database.ts`)
- `DatabaseConfig` - การตั้งค่าฐานข้อมูล
- `QueryResult<T>` - ผลลัพธ์จาก query
- `PaginatedResult<T>` - ผลลัพธ์แบบแบ่งหน้า
- `ConnectionHealth` - สถานะสุขภาพการเชื่อมต่อ
- `DatabaseHealth` - สถานะสุขภาพฐานข้อมูลโดยรวม

#### 2. Security Types (`security.ts`)
- `ValidationRule` - กฎการ validate ข้อมูล
- `ThreatLevel` - ระดับความเสี่ยง
- `CSPDirectives` - Content Security Policy
- `SecurityEvent` - เหตุการณ์ด้านความปลอดภัย
- `RequestFingerprint` - ลายนิ้วมือของ request

#### 3. Logging Types (`logging.ts`)
- `LogLevel` - ระดับการ log
- `LogData` - ข้อมูลพื้นฐานของ log
- `ErrorLogData` - ข้อมูล error log
- `PerformanceLogData` - ข้อมูล performance log
- `SecurityLogData` - ข้อมูล security log

#### 4. Cache Types (`cache.ts`)
- `CacheEntry<T>` - รายการใน cache
- `CacheOptions` - ตัวเลือกการ cache
- `CacheStats` - สถิติการใช้ cache
- `CacheProvider` - interface สำหรับ cache provider
- `CacheStrategy` - กลยุทธ์การ cache

#### 5. Performance Types (`performance.ts`)
- `PerformanceMetric` - metrics พื้นฐาน
- `ApiRequestTiming` - เวลาการ request API
- `WebVitalsMetrics` - Web Vitals ต่างๆ
- `MemoryMetric` - การใช้ memory
- `PerformanceBudget` - งบประมาณ performance

### 🔧 การใช้งาน

#### Import แบบเฉพาะเจาะจง
```typescript
import { DatabaseConfig, QueryResult } from '@/lib/types/database';
import { ValidationRule, ThreatLevel } from '@/lib/types/security';
```

#### Import จาก index (แนะนำ)
```typescript
import { 
  DatabaseConfig, 
  QueryResult, 
  ValidationRule, 
  ThreatLevel 
} from '@/lib/types';
```

#### ตัวอย่างการใช้งาน
```typescript
// Database query function
async function fetchUsers(config: DatabaseConfig): Promise<QueryResult<User[]>> {
  // Implementation
}

// Security validation
function validateInput(data: unknown, rules: ValidationRule[]): boolean {
  // Implementation
}

// Performance monitoring
function trackMetric(metric: PerformanceMetric): void {
  // Implementation
}
```

### 🚀 Best Practices

1. **ใช้ Generics** เมื่อเป็นไปได้
   ```typescript
   interface QueryResult<T> {
     data: T;
     meta?: ResultSetHeader;
   }
   ```

2. **Extend interfaces** แทนการสร้างใหม่
   ```typescript
   interface CountResult extends RowDataPacket {
     total: number;
   }
   ```

3. **ใช้ Union Types** สำหรับ enums
   ```typescript
   type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
   ```

4. **Optional Properties** ใช้เครื่องหมาย `?`
   ```typescript
   interface CacheOptions {
     ttl?: number;
     tags?: string[];
   }
   ```

### 🔄 Migration Guide

หากมีโค้ดเก่าที่ใช้ types แบบเดิม:

1. **ค้นหา** interface definitions ในไฟล์เดิม
2. **ลบ** interface definitions ออก
3. **เพิ่ม** import จาก types folder
4. **ตรวจสอบ** TypeScript errors และแก้ไข

### ⚠️ หมายเหตุสำคัญ

1. **Breaking Changes** - การเปลี่ยนแปลง types อาจส่งผลต่อไฟล์อื่นๆ
2. **Circular Dependencies** - หลีกเลี่ยงการ import แบบวนกลับ
3. **Naming Conventions** - ใช้ชื่อที่สื่อความหมายชัดเจน
4. **Documentation** - เพิ่ม JSDoc comments สำหรับ types ที่ซับซ้อน

---

**สร้างเมื่อ**: พฤศจิกายน 2024  
**อัปเดตล่าสุด**: การ refactor lib types structure  
**ผู้พัฒนา**: Claude Code Assistant