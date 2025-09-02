// Complaint feature types

import {
  BaseError,
  BaseApiResponse,
  ClientSectionConfig,
  ClientSectionErrorMessages,
  ClientSectionSuccessMessages,
  createBaseError,
  BASE_ERROR_MESSAGES,
  BASE_SUCCESS_MESSAGES,
  CLIENT_SECTION_CONSTANTS,
} from './client-sections';

export interface ComplaintFormData {
  memberid: string;
  name: string;
  tel: string;
  email: string;
  complaint: string;
  [key: string]: string; // Add index signature for compatibility with Record<string, unknown>
}

export interface ComplaintApiResponse<T = unknown> extends BaseApiResponse<T> {
  data?: {
    id?: number;
    status?: string;
    timestamp?: string;
  } & T;
}

export interface ComplaintDialogProps {
  open: boolean;
  handleClose: () => void;
}

export interface ComplaintFormErrors {
  memberid?: string;
  name?: string;
  tel?: string;
  email?: string;
  complaint?: string;
  [key: string]: string | undefined; // Add index signature for compatibility
}

// Form validation rules
export interface ComplaintValidationRules {
  email: RegExp;
  tel: RegExp;
  minComplaintLength: number;
  maxComplaintLength: number;
}

export const COMPLAINT_VALIDATION: ComplaintValidationRules = {
  email: /\S+@\S+\.\S+/,
  tel: /^[0-9-+()\s]+$/,
  minComplaintLength: 10,
  maxComplaintLength: 1000,
} as const;

// Complaint configuration extending base config
export const COMPLAINT_CONFIG: Partial<ClientSectionConfig> = {
  defaultCacheTime: CLIENT_SECTION_CONSTANTS.DEFAULT_CACHE_TIME,
  maxRetryAttempts: CLIENT_SECTION_CONSTANTS.MAX_RETRY_ATTEMPTS,
  retryDelay: CLIENT_SECTION_CONSTANTS.RETRY_DELAY,
  apiEndpoint: '/Complaint',
} as const;

// API endpoints
export const COMPLAINT_ENDPOINTS = {
  SUBMIT: COMPLAINT_CONFIG.apiEndpoint || '/Complaint',
} as const;

// Error messages extending base messages
export const COMPLAINT_ERROR_MESSAGES: ClientSectionErrorMessages & {
  submitError: string;
  REQUIRED_COMPLAINT: string;
  INVALID_EMAIL: string;
  INVALID_TEL: string;
  COMPLAINT_TOO_SHORT: string;
  COMPLAINT_TOO_LONG: string;
  SUCCESS_MESSAGE: string;
} = {
  ...BASE_ERROR_MESSAGES,
  submitError: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
  REQUIRED_COMPLAINT: 'กรุณากรอกข้อเสนอแนะหรือร้องเรียน',
  INVALID_EMAIL: 'กรุณากรอกอีเมลให้ถูกต้อง',
  INVALID_TEL: 'กรุณากรอกเบอร์โทรให้ถูกต้อง',
  COMPLAINT_TOO_SHORT: `ข้อเสนอแนะต้องมีอย่างน้อย ${COMPLAINT_VALIDATION.minComplaintLength} ตัวอักษร`,
  COMPLAINT_TOO_LONG: `ข้อเสนอแนะต้องมีไม่เกิน ${COMPLAINT_VALIDATION.maxComplaintLength} ตัวอักษร`,
  SUCCESS_MESSAGE: 'ส่งข้อเสนอแนะสำเร็จแล้ว',
} as const;

// Success messages extending base messages
export const COMPLAINT_SUCCESS_MESSAGES: ClientSectionSuccessMessages & {
  SUBMIT_SUCCESS: string;
} = {
  ...BASE_SUCCESS_MESSAGES,
  SUBMIT_SUCCESS: COMPLAINT_ERROR_MESSAGES.SUCCESS_MESSAGE,
  submitSuccess: COMPLAINT_ERROR_MESSAGES.SUCCESS_MESSAGE,
} as const;

// Form field names
export const COMPLAINT_FORM_FIELDS = {
  MEMBER_ID: 'memberid',
  NAME: 'name',
  TEL: 'tel',
  EMAIL: 'email',
  COMPLAINT: 'complaint',
} as const;

// Helper functions using base utilities
export const createComplaintError = (
  message: string,
  code?: string,
  context?: Record<string, unknown>
): BaseError => createBaseError(message, code, context);