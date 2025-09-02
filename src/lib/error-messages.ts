/**
 * Error Messages Mapping
 * แมปข้อความ error เป็นภาษาไทยและอังกฤษ
 */

import { ApiErrorCodes } from "@/types/api-responses";

// Error message mapping (Thai/English)
export const ERROR_MESSAGES: Record<ApiErrorCodes, { th: string; en: string }> = {
  // Database Errors
  [ApiErrorCodes.DB_CONNECTION_ERROR]: {
    th: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้",
    en: "Unable to connect to database"
  },
  [ApiErrorCodes.DB_TIMEOUT]: {
    th: "การเชื่อมต่อฐานข้อมูลหมดเวลา",
    en: "Database connection timeout"
  },
  [ApiErrorCodes.DB_QUERY_ERROR]: {
    th: "เกิดข้อผิดพลาดในการสืบค้นข้อมูล",
    en: "Database query error"
  },
  [ApiErrorCodes.DB_CONSTRAINT_ERROR]: {
    th: "ข้อมูลไม่ตรงตามเงื่อนไขของฐานข้อมูล",
    en: "Database constraint violation"
  },
  [ApiErrorCodes.DB_DUPLICATE_ENTRY]: {
    th: "ข้อมูลซ้ำในระบบ",
    en: "Duplicate entry found"
  },
  [ApiErrorCodes.DB_ERROR]: {
    th: "เกิดข้อผิดพลาดระบบฐานข้อมูล",
    en: "Database system error"
  },

  // Validation Errors
  [ApiErrorCodes.INVALID_INPUT]: {
    th: "ข้อมูลที่ป้อนไม่ถูกต้อง",
    en: "Invalid input provided"
  },
  [ApiErrorCodes.MISSING_REQUIRED_FIELD]: {
    th: "กรุณากรอกข้อมูลที่จำเป็น",
    en: "Required field is missing"
  },
  [ApiErrorCodes.INVALID_DATA_FORMAT]: {
    th: "รูปแบบข้อมูลไม่ถูกต้อง",
    en: "Invalid data format"
  },
  [ApiErrorCodes.INVALID_FILE_TYPE]: {
    th: "ประเภทไฟล์ไม่ถูกต้อง",
    en: "Invalid file type"
  },
  [ApiErrorCodes.INVALID_FILE_SIZE]: {
    th: "ขนาดไฟล์เกินกำหนด",
    en: "File size exceeds limit"
  },
  [ApiErrorCodes.INVALID_EMAIL_FORMAT]: {
    th: "รูปแบบอีเมลไม่ถูกต้อง",
    en: "Invalid email format"
  },
  [ApiErrorCodes.INVALID_PHONE_FORMAT]: {
    th: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง",
    en: "Invalid phone number format"
  },

  // Authentication & Authorization
  [ApiErrorCodes.UNAUTHORIZED]: {
    th: "กรุณาเข้าสู่ระบบ",
    en: "Authentication required"
  },
  [ApiErrorCodes.FORBIDDEN]: {
    th: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
    en: "Access forbidden"
  },
  [ApiErrorCodes.TOKEN_EXPIRED]: {
    th: "โทเคนหมดอายุ กรุณาเข้าสู่ระบบใหม่",
    en: "Token expired, please login again"
  },
  [ApiErrorCodes.INVALID_TOKEN]: {
    th: "โทเคนไม่ถูกต้อง",
    en: "Invalid token"
  },
  [ApiErrorCodes.SESSION_EXPIRED]: {
    th: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
    en: "Session expired, please login again"
  },

  // Rate Limiting
  [ApiErrorCodes.RATE_LIMIT_EXCEEDED]: {
    th: "คำขอเกินกำหนด กรุณารอสักครู่",
    en: "Rate limit exceeded, please wait"
  },
  [ApiErrorCodes.IP_BLOCKED]: {
    th: "IP ของคุณถูกบล็อก",
    en: "Your IP address is blocked"
  },
  [ApiErrorCodes.SUSPICIOUS_ACTIVITY]: {
    th: "ตรวจพบกิจกรรมที่น่าสงสัย",
    en: "Suspicious activity detected"
  },

  // File Operations
  [ApiErrorCodes.FILE_NOT_FOUND]: {
    th: "ไม่พบไฟล์ที่ระบุ",
    en: "File not found"
  },
  [ApiErrorCodes.FILE_UPLOAD_ERROR]: {
    th: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์",
    en: "File upload error"
  },
  [ApiErrorCodes.FILE_PROCESSING_ERROR]: {
    th: "เกิดข้อผิดพลาดในการประมวลผลไฟล์",
    en: "File processing error"
  },
  [ApiErrorCodes.STORAGE_FULL]: {
    th: "พื้นที่จัดเก็บเต็ม",
    en: "Storage space full"
  },

  // Cache Operations
  [ApiErrorCodes.CACHE_ERROR]: {
    th: "เกิดข้อผิดพลาดในระบบแคช",
    en: "Cache system error"
  },
  [ApiErrorCodes.CACHE_MISS]: {
    th: "ไม่พบข้อมูลในแคช",
    en: "Cache miss"
  },
  [ApiErrorCodes.CACHE_TIMEOUT]: {
    th: "แคชหมดเวลา",
    en: "Cache timeout"
  },

  // Business Logic
  [ApiErrorCodes.MEMBER_NOT_FOUND]: {
    th: "ไม่พบข้อมูลสมาชิก",
    en: "Member not found"
  },
  [ApiErrorCodes.ACCOUNT_INACTIVE]: {
    th: "บัญชีไม่ได้ใช้งาน",
    en: "Account is inactive"
  },
  [ApiErrorCodes.INSUFFICIENT_BALANCE]: {
    th: "ยอดเงินไม่เพียงพอ",
    en: "Insufficient balance"
  },
  [ApiErrorCodes.TRANSACTION_LIMIT_EXCEEDED]: {
    th: "เกินขlimit การทำธุรกรรม",
    en: "Transaction limit exceeded"
  },
  [ApiErrorCodes.DUPLICATE_REQUEST]: {
    th: "คำขอซ้ำ",
    en: "Duplicate request"
  },

  // External Services
  [ApiErrorCodes.EXTERNAL_SERVICE_ERROR]: {
    th: "บริการภายนอกไม่พร้อมใช้งาน",
    en: "External service unavailable"
  },
  [ApiErrorCodes.PAYMENT_GATEWAY_ERROR]: {
    th: "เกิดข้อผิดพลาดในระบบชำระเงิน",
    en: "Payment gateway error"
  },
  [ApiErrorCodes.SMS_SERVICE_ERROR]: {
    th: "เกิดข้อผิดพลาดในการส่ง SMS",
    en: "SMS service error"
  },
  [ApiErrorCodes.EMAIL_SERVICE_ERROR]: {
    th: "เกิดข้อผิดพลาดในการส่งอีเมล",
    en: "Email service error"
  },

  // Configuration Errors
  [ApiErrorCodes.CONFIG_ERROR]: {
    th: "เกิดข้อผิดพลาดการตั้งค่าระบบ",
    en: "System configuration error"
  },
  [ApiErrorCodes.FILE_ACCESS_ERROR]: {
    th: "ไม่สามารถเข้าถึงไฟล์ได้",
    en: "File access denied"
  },

  // Generic
  [ApiErrorCodes.INTERNAL_ERROR]: {
    th: "เกิดข้อผิดพลาดภายในระบบ",
    en: "Internal server error"
  },
  [ApiErrorCodes.SERVICE_UNAVAILABLE]: {
    th: "บริการไม่พร้อมใช้งานในขณะนี้",
    en: "Service temporarily unavailable"
  },
  [ApiErrorCodes.MAINTENANCE_MODE]: {
    th: "ระบบอยู่ระหว่างการบำรุงรักษา",
    en: "System under maintenance"
  },
  [ApiErrorCodes.FEATURE_NOT_AVAILABLE]: {
    th: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน",
    en: "Feature not available"
  }
};

// Get localized error message
export function getErrorMessage(
  code: ApiErrorCodes, 
  language: 'th' | 'en' = 'th',
  customMessage?: string
): string {
  if (customMessage) {
    return customMessage;
  }
  
  const messageMap = ERROR_MESSAGES[code];
  if (!messageMap) {
    return language === 'th' 
      ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" 
      : "Unknown error occurred";
  }
  
  return messageMap[language];
}

// Get user-friendly error message based on context
export function getUserFriendlyMessage(
  code: ApiErrorCodes,
  language: 'th' | 'en' = 'th',
  context?: Record<string, unknown>
): string {
  const baseMessage = getErrorMessage(code, language);
  
  // Add context-specific information
  switch (code) {
    case ApiErrorCodes.RATE_LIMIT_EXCEEDED:
      if (context?.windowMs) {
        const seconds = Math.round(Number(context.windowMs) / 1000);
        return language === 'th' 
          ? `${baseMessage} (กรุณารอ ${seconds} วินาที)`
          : `${baseMessage} (please wait ${seconds} seconds)`;
      }
      break;
      
    case ApiErrorCodes.INVALID_FILE_SIZE:
      if (context?.maxSize) {
        const maxMB = Math.round(Number(context.maxSize) / (1024 * 1024));
        return language === 'th'
          ? `${baseMessage} (ขนาดสูงสุด ${maxMB} MB)`
          : `${baseMessage} (maximum ${maxMB} MB)`;
      }
      break;
      
    case ApiErrorCodes.MISSING_REQUIRED_FIELD:
      if (context?.field) {
        return language === 'th'
          ? `กรุณากรอก ${context.field}`
          : `Please provide ${context.field}`;
      }
      break;
  }
  
  return baseMessage;
}