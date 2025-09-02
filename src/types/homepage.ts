// types/homepage.ts - Homepage specific type definitions

/**
 * StatusHome API Response Types
 */
export interface HomeStatusItem {
  Id: number;
  Status: number;
}

export interface StatusHomeResponse {
  data?: HomeStatusItem[];
  success?: boolean;
  message?: string;
}

/**
 * Homepage Component Props
 */
export interface HomeClientProps {
  // Reserved for future server-side props
  initialData?: unknown;
}

/**
 * Homepage State Types
 */
export interface HomeState {
  isHappyNewYear: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Environment Variables Type
 */
export interface HomepageEnvironment {
  NEXT_PUBLIC_API_BASE_URL: string;
}

/**
 * DOM Element Type Guards
 */
export function isHTMLElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement;
}

/**
 * Status Check Utilities
 */
export class StatusChecker {
  static isHappyNewYear(items: HomeStatusItem[]): boolean {
    return items.some(item => item.Id === 2 && item.Status === 1);
  }

  static isSnowEffect(items: HomeStatusItem[]): boolean {
    return items.some(item => item.Id === 3 && item.Status === 1);
  }
}

/**
 * API Response Type Guards
 */
export function isValidStatusResponse(data: unknown): data is StatusHomeResponse {
  if (!data || typeof data !== 'object') return false;
  
  const response = data as StatusHomeResponse;
  
  // Check if data is array and contains valid items
  if (response.data && Array.isArray(response.data)) {
    return response.data.every(item => 
      typeof item === 'object' &&
      typeof item.Id === 'number' &&
      typeof item.Status === 'number'
    );
  }
  
  return true; // Allow empty response
}

/**
 * Error Type Guards
 */
export function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiErrorResponse).message === 'string'
  );
}

/**
 * CSS Class Names Type
 */
export type HomepageClassName = 
  | 'happy-new-year'
  | 'bg-cover'
  | 'homepage'
  | string;

/**
 * Component Section Types
 */
export interface ComponentSection {
  id: string;
  ariaLabel: string;
  component: React.ComponentType;
  priority: 'high' | 'medium' | 'low';
  lazy?: boolean;
}