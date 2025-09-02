/**
 * Types for Organizational data and components
 */

// API Response Types
export interface ApiOrganizational {
  Id: number;
  Name: string;
  Position: string;
  Priority: number;
  Type: string;
  ImagePath: string | null;
}

// Frontend Application Types
export interface BoardMember {
  id: number;
  name: string;
  position: string;
  priority: string;
  type: string;
  imagePath: string;
}

// Board Component Props
export interface BoardComponentProps {
  initialData: BoardMember[];
}

// Priority levels for board members
export type PriorityLevel = "1" | "2" | "3" | "4" | "5";

// Board types
export type BoardType = 
  | "คณะกรรมการดำเนินการ ชุดที่ 49"
  | "ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ"
  | "ผู้จัดการใหญ่และรองผู้จัดการฯ"
  | "ฝ่ายสินเชื่อ"
  | "ฝ่ายการเงินและการลงทุน"
  | "ฝ่ายสมาชิกสัมพันธ์และสวัสดิการ"
  | "ฝ่ายทะเบียนหุ้นและติดตามหนี้สิน"
  | "ฝ่ายบริหารทั่วไป"
  | "ฝ่ายบัญชี"
  | "ฝ่ายสารสนเทศ";

// Enhanced API Error Response
export interface ApiErrorResponse {
  error: string;
  message: string;
  code: string;
  timestamp: string;
}

// Legacy error interface (deprecated)
export interface OrganizationalError {
  error: string;
  message?: string;
}

// Error codes for better error handling
export enum ApiErrorCode {
  DB_CONNECTION_ERROR = "DB_CONNECTION_ERROR",
  DB_TIMEOUT = "DB_TIMEOUT", 
  DB_QUERY_ERROR = "DB_QUERY_ERROR",
  INVALID_DATA_FORMAT = "INVALID_DATA_FORMAT",
  TABLE_NOT_FOUND = "TABLE_NOT_FOUND",
  COLUMN_NOT_FOUND = "COLUMN_NOT_FOUND",
  NO_DATA_FOUND = "NO_DATA_FOUND",
  NO_VISION_DATA = "NO_VISION_DATA",
  INTERNAL_ERROR = "INTERNAL_ERROR"
}

// Component States
export interface OrganizationalState {
  loading: boolean;
  error: string | null;
  data: BoardMember[];
}

// Enhanced component states with detailed error info
export interface EnhancedOrganizationalState {
  loading: boolean;
  error: ApiErrorResponse | null;
  data: BoardMember[];
  lastFetch: string | null;
  retryCount: number;
}