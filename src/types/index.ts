// types/index.ts

// Re-export all questions types
export * from './questions';
export interface Slide {
  id: number;
  no: number;
  image: string;
  imagePath: string;
  url: string;
}

// Deprecated: Use NewsItem instead
export interface News {
  id: number;
  title: string;
  details: string;
  image: string;
  imagePath: string;
  pdfPath: string;
  pdffile: string;
  File: string;
  filepath: string;
  Title: string;
  createDate: string;
}
export interface Interest {
  id: number;
  interestType: string;
  name: string;
  interestDate: string;
  conditions: string;
  interestRate: string;
  interesrRateDual: string;
}

export interface DownloadForm {
  id: number;
  title: string;
  typeForm: string;
  typeMember: string;
  pdffile: string | null;
  filePath: string | null;
  File: string;
  createDate: string;
}

export interface ReportBusiness {
  id: number;
  title: string;
  image: string;
  imagePath: string;
  pdffile: string;
  File: string;
  filepath: string;
  Title: string;
  createDate: string;
}
// API Response Type for Services
export interface ApiServices {
  Id: number;
  Subcategories: string;
  ImagePath: string;
  URLLink: string;
  IsActive: boolean;
}

// Frontend Application Type for Services  
export interface Services {
  id: number;
  imagePath: string;
  subcategories: string;
  urlLink: string;
  urlLinks: string[];
  status: boolean;
}

export interface Application {
  Id: number;
  Title: string;
  Detail: string;
  ImageNumber: number;
  ImagePath: string;
  ApplicationMainType: string;
  ApplicationType: string;
  CreateDate: string;
  id: number;
  title: string;
  detail: string;
  imageNumber: number;
  imagePath: string;
  applicationMainType: string;
  applicationType: string;
  createDate: string;
}

// Additional interfaces for better type safety
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

// Primary News interface - matches API response format
export interface NewsItem {
  Id: number;
  Title: string;
  Details: string;
  ImagePath?: string;
  PdfPath?: string;
  CreateDate: string;
}

export interface ServiceItem {
  Id: number;
  Subcategories: string;
  ImagePath: string;
  URLLink: string;
  CreateDate: string;
}

export interface BoardMember {
  Id: number;
  Name: string;
  Position: string;
  Type: string;
  ImagePath?: string;
  CreateDate: string;
}

export interface FormItem {
  Id: number;
  Title: string;
  TypeForm: string;
  FilePath: string;
  CreateDate: string;
}

// API response interface for Statute/Regularity/Declare forms
export interface SRDFormData {
  Id: number;
  Title: string;
  TypeForm: string;
  TypeMember: string;
  FilePath: string | null;
  CreateDate: string;
}

// API response interface for DownloadForm pages (Appeal, Loan, Membership, etc.)
export interface FormDownloadResponse {
  Id: number;
  Title: string;
  TypeForm: string;
  TypeMember: string;
  FilePath: string | null;
  CreateDate?: string;
}

export interface DatabaseQueryResult<T> {
  rows: T[];
  metadata: unknown;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Install component specific interfaces
export interface ImageWithDimensions {
  src: string;
  width: number;
  height: number;
}

export interface LightboxImage {
  src: string;
}

export interface LoadingComponentProps {
  animationData: unknown;
}

// Common API response interfaces
export interface ApiSociety {
  Id: number;
  ImagePath: string;
  SocietyType: string;
  IsActive: boolean;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// Re-export all types
export * from './homepage';
export * from './about';
export * from './service';
export * from './home';
export * from './common';
export * from './database';
export * from './api-responses';