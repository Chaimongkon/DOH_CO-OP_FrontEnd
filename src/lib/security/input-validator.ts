/**
 * Advanced Input Validation System
 * ระบบตรวจสอบข้อมูลนำเข้าขั้นสูงสำหรับความปลอดภัย
 */

import { ValidationError } from "@/lib/api-errors";
import logger from "@/lib/logger";
import { 
  ValidationRule, 
  ValidationSchema,
  FileValidationOptions,
  FileToValidate 
} from "@/lib/types/security";

// Security Patterns
export const SECURITY_PATTERNS = {
  // SQL Injection Detection
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b|--|\/\*|\*\/|'|;|\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  
  // XSS Detection  
  XSS_SCRIPT: /<script[^>]*>.*?<\/script>/gi,
  XSS_JAVASCRIPT: /javascript:/gi,
  XSS_VBSCRIPT: /vbscript:/gi,
  XSS_ONLOAD: /on\w+\s*=/gi,
  XSS_IFRAME: /<iframe[^>]*>.*?<\/iframe>/gi,
  XSS_OBJECT: /<object[^>]*>.*?<\/object>/gi,
  XSS_EMBED: /<embed[^>]*>.*?<\/embed>/gi,
  
  // Directory Traversal
  DIRECTORY_TRAVERSAL: /(\.\.|\/\.\.|\\\.\.|\%2e\%2e|\%252e\%252e)/i,
  
  // Command Injection
  COMMAND_INJECTION: /(\||&|;|`|\$\(|\${|<|>)/,
  
  // LDAP Injection
  LDAP_INJECTION: /(\*|\(|\)|\||&|!|=|<|>|~|\/)/,
  
  // Thai-specific patterns
  THAI_TEXT: /^[ก-๙\s\.\-\(\)]+$/,
  THAI_NAME: /^[ก-๙\s\.]+$/,
  
  // Standard patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_TH: /^[0-9\-\+\(\)\s]{8,15}$/,
  MEMBER_ID: /^\d{6,10}$/,
  URL_SAFE: /^https?:\/\/[a-zA-Z0-9\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=]+$/,
  
  // File patterns
  SAFE_FILENAME: /^[a-zA-Z0-9\-\._\s\u0e00-\u0e7f]+$/,
  IMAGE_EXTENSION: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  DOCUMENT_EXTENSION: /\.(pdf|doc|docx|xls|xlsx|txt)$/i,
};

// Sanitization Functions
export class InputSanitizer {
  /**
   * HTML Encoding เพื่อป้องกัน XSS
   */
  static encodeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * การทำความสะอาดพื้นฐาน
   */
  static basicSanitize(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .trim();
  }

  /**
   * การทำความสะอาดสำหรับ SQL
   */
  static sqlSanitize(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\x00/g, '\\0')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x1a/g, '\\Z');
  }

  /**
   * การทำความสะอาดชื่อไฟล์
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-\._\s\u0e00-\u0e7f]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 255);
  }

  /**
   * การทำความสะอาด URL
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }
      return parsed.toString();
    } catch {
      throw new ValidationError('Invalid URL format', 'url');
    }
  }

  /**
   * ลบ control characters และ non-printable characters
   */
  static removeControlChars(input: string): string {
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }
}

// Advanced Input Validator Class
export class InputValidator {
  /**
   * ตรวจสอบการโจมตีทางความปลอดภัย
   */
  static detectSecurityThreats(input: string, context?: string): string[] {
    const threats: string[] = [];

    // SQL Injection
    if (SECURITY_PATTERNS.SQL_INJECTION.test(input)) {
      threats.push('SQL_INJECTION');
    }

    // XSS Attacks
    if (SECURITY_PATTERNS.XSS_SCRIPT.test(input) ||
        SECURITY_PATTERNS.XSS_JAVASCRIPT.test(input) ||
        SECURITY_PATTERNS.XSS_VBSCRIPT.test(input) ||
        SECURITY_PATTERNS.XSS_ONLOAD.test(input)) {
      threats.push('XSS_ATTACK');
    }

    // Directory Traversal
    if (SECURITY_PATTERNS.DIRECTORY_TRAVERSAL.test(input)) {
      threats.push('DIRECTORY_TRAVERSAL');
    }

    // Command Injection
    if (SECURITY_PATTERNS.COMMAND_INJECTION.test(input)) {
      threats.push('COMMAND_INJECTION');
    }

    // Log threats
    if (threats.length > 0) {
      logger.security('Security threat detected', {
        threats,
        input: input.substring(0, 100), // Log first 100 chars only
        context,
        severity: 'high'
      });
    }

    return threats;
  }

  /**
   * ตรวจสอบข้อมูลตามกฎที่กำหนด
   */
  static validateField(
    value: unknown, 
    fieldName: string, 
    rules: ValidationRule,
    context?: string
  ): string {
    // Required validation
    if (rules.required && (value === null || value === undefined || value === '')) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    // Skip further validation if not required and empty
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return '';
    }

    const stringValue = String(value);

    // Security threat detection
    const threats = this.detectSecurityThreats(stringValue, context);
    if (threats.length > 0) {
      throw new ValidationError(
        `Security threat detected in ${fieldName}: ${threats.join(', ')}`,
        fieldName,
        { threats, severity: 'high' }
      );
    }

    // Type validation
    switch (rules.type) {
      case 'email':
        if (!SECURITY_PATTERNS.EMAIL.test(stringValue)) {
          throw new ValidationError(
            rules.errorMessage || `${fieldName} must be a valid email address`,
            fieldName
          );
        }
        break;

      case 'phone':
        if (!SECURITY_PATTERNS.PHONE_TH.test(stringValue)) {
          throw new ValidationError(
            rules.errorMessage || `${fieldName} must be a valid phone number`,
            fieldName
          );
        }
        break;

      case 'memberid':
        if (!SECURITY_PATTERNS.MEMBER_ID.test(stringValue)) {
          throw new ValidationError(
            rules.errorMessage || `${fieldName} must be 6-10 digits`,
            fieldName
          );
        }
        break;

      case 'url':
        if (!SECURITY_PATTERNS.URL_SAFE.test(stringValue)) {
          throw new ValidationError(
            rules.errorMessage || `${fieldName} must be a valid URL`,
            fieldName
          );
        }
        break;

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          throw new ValidationError(
            rules.errorMessage || `${fieldName} must be a number`,
            fieldName
          );
        }
        if (rules.min !== undefined && numValue < rules.min) {
          throw new ValidationError(
            `${fieldName} must be at least ${rules.min}`,
            fieldName
          );
        }
        if (rules.max !== undefined && numValue > rules.max) {
          throw new ValidationError(
            `${fieldName} must not exceed ${rules.max}`,
            fieldName
          );
        }
        break;
    }

    // Length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${rules.minLength} characters`,
        fieldName
      );
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      throw new ValidationError(
        `${fieldName} must not exceed ${rules.maxLength} characters`,
        fieldName
      );
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      throw new ValidationError(
        rules.errorMessage || `${fieldName} format is invalid`,
        fieldName
      );
    }

    // Allowed values validation
    if (rules.allowedValues && !rules.allowedValues.includes(stringValue)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${rules.allowedValues.join(', ')}`,
        fieldName
      );
    }

    // Custom validation
    if (rules.customValidator && !rules.customValidator(value)) {
      throw new ValidationError(
        rules.errorMessage || `${fieldName} validation failed`,
        fieldName
      );
    }

    // Sanitization
    if (rules.sanitize) {
      return InputSanitizer.basicSanitize(stringValue);
    }

    return stringValue;
  }

  /**
   * ตรวจสอบหลายฟิลด์พร้อมกัน
   */
  static validateObject(
    data: Record<string, unknown>,
    schema: ValidationSchema,
    context?: string
  ): Record<string, unknown> {
    const validatedData: Record<string, unknown> = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = data[fieldName];
      validatedData[fieldName] = this.validateField(value, fieldName, rules, context);
    }

    return validatedData;
  }

  /**
   * ตรวจสอบไฟล์อัปโหลด
   */
  static validateFile(
    file: FileToValidate,
    options: FileValidationOptions = {}
  ): void {
    const { maxSize = 10 * 1024 * 1024, allowedTypes, allowedExtensions } = options;

    // Size check
    if (file.size > maxSize) {
      throw new ValidationError(
        `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`,
        'fileSize'
      );
    }

    // Type check
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new ValidationError(
        `File type ${file.type} is not allowed`,
        'fileType'
      );
    }

    // Extension check
    if (allowedExtensions) {
      const extension = file.name.toLowerCase().split('.').pop();
      if (!extension || !allowedExtensions.includes(extension)) {
        throw new ValidationError(
          `File extension .${extension} is not allowed`,
          'fileExtension'
        );
      }
    }

    // Filename security check
    const threats = this.detectSecurityThreats(file.name, 'filename');
    if (threats.length > 0) {
      throw new ValidationError(
        `Malicious filename detected: ${threats.join(', ')}`,
        'filename',
        { threats }
      );
    }

    // Check for safe filename pattern
    if (!SECURITY_PATTERNS.SAFE_FILENAME.test(file.name)) {
      throw new ValidationError(
        'Filename contains invalid characters',
        'filename'
      );
    }
  }
}

// Pre-defined validation schemas
export const VALIDATION_SCHEMAS: Record<string, ValidationSchema> = {
  // User input schemas
  COMPLAINT: {
    memberid: {
      type: 'memberid' as const,
      required: false,
      sanitize: true,
      errorMessage: 'รหัสสมาชิกต้องเป็นตัวเลข 6-10 หลัก'
    },
    name: {
      type: 'string' as const,
      required: false,
      minLength: 2,
      maxLength: 100,
      pattern: SECURITY_PATTERNS.THAI_NAME,
      sanitize: true,
      errorMessage: 'ชื่อต้องเป็นภาษาไทยและมีความยาว 2-100 ตัวอักษร'
    },
    tel: {
      type: 'phone' as const,
      required: false,
      sanitize: true,
      errorMessage: 'หมายเลขโทรศัพท์ไม่ถูกต้อง'
    },
    email: {
      type: 'email' as const,
      required: false,
      maxLength: 254,
      sanitize: true,
      errorMessage: 'อีเมลไม่ถูกต้อง'
    },
    complaint: {
      type: 'string' as const,
      required: true,
      minLength: 10,
      maxLength: 2000,
      sanitize: true,
      errorMessage: 'เนื้อหาการร้องเรียนต้องมีความยาว 10-2000 ตัวอักษร'
    }
  },

  QUESTION: {
    name: {
      type: 'string' as const,
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: SECURITY_PATTERNS.THAI_NAME,
      sanitize: true,
      errorMessage: 'ชื่อต้องเป็นภาษาไทยและมีความยาว 2-100 ตัวอักษร'
    },
    memberNumber: {
      type: 'memberid' as const,
      required: true,
      sanitize: true,
      errorMessage: 'รหัสสมาชิกต้องเป็นตัวเลข 6-10 หลัก'
    },
    title: {
      type: 'string' as const,
      required: true,
      minLength: 5,
      maxLength: 200,
      sanitize: true,
      errorMessage: 'หัวข้อคำถามต้องมีความยาว 5-200 ตัวอักษร'
    },
    body: {
      type: 'string' as const,
      required: true,
      minLength: 10,
      maxLength: 2000,
      sanitize: true,
      errorMessage: 'เนื้อหาคำถามต้องมีความยาว 10-2000 ตัวอักษร'
    }
  },

  COOKIE_CONSENT: {
    userId: {
      type: 'string' as const,
      required: false,
      maxLength: 100,
      sanitize: true
    },
    consentStatus: {
      type: 'custom' as const,
      required: true,
      customValidator: (value: unknown) => typeof value === 'boolean'
    },
    cookieCategories: {
      type: 'string' as const,
      required: true,
      maxLength: 500,
      sanitize: true
    },
    consentDate: {
      type: 'string' as const,
      required: true,
      customValidator: (value: unknown) => typeof value === 'string' && !isNaN(Date.parse(value))
    }
  }
};

export default InputValidator;