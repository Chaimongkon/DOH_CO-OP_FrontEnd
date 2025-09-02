// Common types and interfaces for Client Sections

// Generic base props for client components
export interface BaseClientProps<T = unknown> {
  initialData: T[];
}

// Base API response structure
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  timestamp?: string;
}

// Base service data structure from API
export interface BaseApiService {
  Id: number;
  ImagePath?: string;
  Subcategories: string;
  URLLink?: string;
  IsActive: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
  Description?: string;
  Title?: string;
  Priority?: number;
}

// Base processed service for frontend use
export interface BaseService {
  id: number;
  imagePath: string;
  subcategories: string;
  urlLink?: string;
  status: boolean;
  description?: string;
  title?: string;
  priority?: number;
}

// Base error structure
export interface BaseError {
  code?: string;
  message: string;
  details?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
}

// Loading states used across client sections
export type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'refetching';

// Base filters for services
export interface BaseFilters {
  subcategory?: string;
  isActive?: boolean;
  hasDocument?: boolean;
  hasImage?: boolean;
  search?: string;
}

// Base search and pagination options
export interface BaseSearchOptions {
  query?: string;
  filters?: BaseFilters;
  sortBy?: keyof BaseService;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Component state interface
export interface BaseComponentState<T = BaseService> {
  data: T[];
  loading: boolean;
  error: BaseError | null;
  filters?: BaseFilters;
  searchOptions?: BaseSearchOptions;
}

// Common configuration for client sections
export interface ClientSectionConfig {
  subcategoryFilter: string;
  defaultCacheTime: number;
  maxRetryAttempts: number;
  retryDelay: number;
  apiEndpoint: string;
}

// UI text constants structure
export interface ClientSectionUIText {
  loadingText: string;
  emptyTitle: string;
  emptyDescription: string;
  retryButton: string;
  downloadDocument: string;
  noImageAlt: string;
  pageTitle: string;
  documentFormPrefix: string;
}

// Error messages structure
export interface ClientSectionErrorMessages {
  fetchError: string;
  networkError: string;
  serverError: string;
  unauthorized: string;
  notFound: string;
  timeout: string;
  submitError?: string;
}

// Success messages structure
export interface ClientSectionSuccessMessages {
  dataLoaded: string;
  dataRefreshed: string;
  submitSuccess?: string;
}

// Image configuration
export interface ClientSectionImageConfig {
  defaultWidth: number;
  defaultHeight: number;
  quality: number;
  formats: readonly string[];
  sizes: string;
  placeholder: 'blur' | 'empty';
}

// Event handlers for client sections
export interface BaseEventHandlers<T = BaseService> {
  onRetry?: () => void;
  onRefresh?: () => void;
  onFilter?: (filters: BaseFilters) => void;
  onSort?: (sortBy: keyof T, sortOrder: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onItemClick?: (item: T) => void;
}

// Props for error boundaries
export interface BaseErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Common constants used across client sections
export const CLIENT_SECTION_CONSTANTS = {
  DEFAULT_CACHE_TIME: 3600, // 1 hour
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  DEFAULT_PAGE_SIZE: 10,
  MAX_SEARCH_LENGTH: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Default configurations
export const DEFAULT_CLIENT_SECTION_CONFIG: Partial<ClientSectionConfig> = {
  defaultCacheTime: CLIENT_SECTION_CONSTANTS.DEFAULT_CACHE_TIME,
  maxRetryAttempts: CLIENT_SECTION_CONSTANTS.MAX_RETRY_ATTEMPTS,
  retryDelay: CLIENT_SECTION_CONSTANTS.RETRY_DELAY,
} as const;

export const DEFAULT_IMAGE_CONFIG: ClientSectionImageConfig = {
  defaultWidth: 800,
  defaultHeight: 600,
  quality: 85,
  formats: ['webp', 'jpeg'] as const,
  sizes: '(max-width: 480px) 90vw, (max-width: 768px) 80vw, 60vw',
  placeholder: 'blur',
} as const;

// Common error messages in Thai
export const BASE_ERROR_MESSAGES: ClientSectionErrorMessages = {
  fetchError: 'ไม่สามารถโหลดข้อมูลได้',
  networkError: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
  serverError: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่ในภายหลัง',
  unauthorized: 'ไม่มีสิทธิ์เข้าถึงข้อมูล',
  notFound: 'ไม่พบข้อมูลที่ต้องการ',
  timeout: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
} as const;

export const BASE_SUCCESS_MESSAGES: ClientSectionSuccessMessages = {
  dataLoaded: 'โหลดข้อมูลสำเร็จ',
  dataRefreshed: 'อัปเดตข้อมูลสำเร็จ',
} as const;

export const BASE_UI_TEXT: ClientSectionUIText = {
  loadingText: 'กำลังโหลดข้อมูล...',
  emptyTitle: 'ไม่พบข้อมูล',
  emptyDescription: 'ไม่มีข้อมูลที่จะแสดง',
  retryButton: 'ลองใหม่',
  downloadDocument: 'ดาวน์โหลดเอกสาร',
  noImageAlt: 'ไม่มีรูปภาพ',
  pageTitle: 'ข้อมูล',
  documentFormPrefix: 'แบบฟอร์ม',
} as const;

// Utility functions
export const createBaseError = (
  message: string,
  code?: string,
  context?: Record<string, unknown>
): BaseError => ({
  message,
  code,
  context,
  timestamp: new Date().toISOString(),
});

export const mapBaseApiServiceToService = (
  apiService: BaseApiService,
  fileUrl: string
): BaseService => ({
  id: apiService.Id,
  imagePath: apiService.ImagePath ? `${fileUrl}${apiService.ImagePath}` : '',
  subcategories: apiService.Subcategories,
  urlLink: apiService.URLLink,
  status: apiService.IsActive,
  description: apiService.Description,
  title: apiService.Title,
  priority: apiService.Priority,
});

export const filterBaseServices = <T extends BaseService>(
  services: T[],
  filters?: BaseFilters
): T[] => {
  if (!filters) return services;

  return services.filter((service) => {
    // Subcategory filter
    if (filters.subcategory && service.subcategories !== filters.subcategory) {
      return false;
    }

    // Active status filter
    if (filters.isActive !== undefined && service.status !== filters.isActive) {
      return false;
    }

    // Document filter
    if (filters.hasDocument !== undefined) {
      const hasDoc = Boolean(service.urlLink);
      if (hasDoc !== filters.hasDocument) return false;
    }

    // Image filter
    if (filters.hasImage !== undefined) {
      const hasImg = Boolean(service.imagePath);
      if (hasImg !== filters.hasImage) return false;
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      const searchFields = [
        service.subcategories,
        service.title,
        service.description,
      ].filter(Boolean);

      const matches = searchFields.some(field =>
        field?.toLowerCase().includes(searchTerm)
      );
      if (!matches) return false;
    }

    return true;
  });
};

export const sortBaseServices = <T extends BaseService>(
  services: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...services].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
    if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue, 'th');
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), 'th');
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

// Type guards
export const isBaseError = (error: unknown): error is BaseError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

export const isBaseService = (service: unknown): service is BaseService => {
  return (
    typeof service === 'object' &&
    service !== null &&
    'id' in service &&
    'imagePath' in service &&
    'subcategories' in service &&
    'status' in service &&
    typeof (service as Record<string, unknown>).id === 'number' &&
    typeof (service as Record<string, unknown>).imagePath === 'string' &&
    typeof (service as Record<string, unknown>).subcategories === 'string' &&
    typeof (service as Record<string, unknown>).status === 'boolean'
  );
};

export const isBaseApiResponse = (response: unknown): response is BaseApiResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as Record<string, unknown>).success === 'boolean'
  );
};

// Hook-like utilities (for future use with custom hooks)
export const createInitialState = <T extends BaseService>(
  initialData: T[]
): BaseComponentState<T> => ({
  data: initialData,
  loading: false,
  error: null,
});

export const createErrorState = <T extends BaseService>(
  error: BaseError
): Partial<BaseComponentState<T>> => ({
  loading: false,
  error,
});

export const createLoadingState = <T extends BaseService>(): Partial<BaseComponentState<T>> => ({
  loading: true,
  error: null,
});

export const createSuccessState = <T extends BaseService>(
  data: T[]
): Partial<BaseComponentState<T>> => ({
  data,
  loading: false,
  error: null,
});

// Validation helpers
export const validateRequiredFields = <T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields
    .filter(field => !data[field] || (typeof data[field] === 'string' && !data[field].trim()))
    .map(String);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

// Debounce utility for search
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number = CLIENT_SECTION_CONSTANTS.DEBOUNCE_DELAY
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};