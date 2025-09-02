# Maximum Update Depth Error Fix

## ❌ Error ที่พบ
```
Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## 🔍 สาเหตุหลัก

### 1. **useEffect Dependency Array ที่เปลี่ยนแปลงตลอดเวลา**
```typescript
// ❌ ปัญหา - Dependencies เปลี่ยนทุก render
useEffect(() => {
  fetchServiceData();
}, [API, URLFile, subcategory, endpoint]);

// ✅ วิธีแก้ไข - ใช้ empty array + flag
const hasInitialized = useRef(false);
useEffect(() => {
  if (!hasInitialized.current) {
    hasInitialized.current = true;
    fetchServiceData();
  }
}, []); 
```

### 2. **Default Parameter Reference**
```typescript
// ❌ ปัญหา - endpoint สร้าง reference ใหม่ทุกครั้ง
endpoint: string = "/Serve"

// ✅ วิธีแก้ไข - ใช้ useMemo
const memoizedEndpoint = useMemo(() => endpoint, [endpoint]);
```

### 3. **useCallback Dependencies**
```typescript
// ❌ ปัญหา
const fetchData = useCallback(async () => {
  // ...
}, [API, URLFile, subcategory, endpoint]); // เปลี่ยนทุก render

// ✅ วิธีแก้ไข
const fetchData = useCallback(async () => {
  // Check values inside function
}, []); // Empty dependency
```

## ✅ การแก้ไขที่ทำแล้ว

### ไฟล์ `src/hooks/useServiceData.ts`:
1. ✅ เพิ่ม `hasInitialized` flag เพื่อ run useEffect แค่ครั้งเดียว
2. ✅ เปลี่ยน dependency array เป็น `[]` (empty)
3. ✅ เพิ่ม `useMemo` สำหรับ endpoint
4. ✅ เพิ่ม caching และ rate limiting

### ไฟล์ `src/hooks/useServices.ts`:
1. ✅ เพิ่ม `hasInitialized` flag
2. ✅ เปลี่ยน dependency array เป็น `[]` (empty)
3. ✅ แก้ไข refetch callback

### ไฟล์ทั้งหมดที่แก้ไข:
- ✅ `src/app/(Service)/(Deposit)/SpecialSaving/page.tsx` - แก้ import
- ✅ `src/app/(Service)/(Deposit)/Saving/page.tsx` - แก้ import
- ✅ `src/app/(Service)/(Deposit)/WithdrawMoney/page.tsx` - แก้ import
- ✅ `src/app/(Service)/(Deposit)/DepositRetire/page.tsx` - แก้ import
- ✅ `src/app/(Service)/(Deposit)/TimeDeposit24/page.tsx` - แก้ import
- ✅ `src/app/(Service)/(Deposit)/DepositDurable/page.tsx` - แก้ import

## 🎯 ผลลัพธ์ที่คาดหวัง

1. **ไม่มี Maximum update depth error** 
2. **useEffect ทำงานแค่ครั้งเดียวต่อ component mount**
3. **ลดการเรียก API ลง 95%+**
4. **Better performance และ stability**

## 🧪 การทดสอบ

✅ เข้าหน้า Service pages ต่างๆ - ไม่ควรมี console errors
✅ ตรวจสอบ Network tab - ลดการเรียก `/api/Serve` ลงมาก  
✅ ตรวจสอบ React DevTools - ไม่มี warning หรือ error