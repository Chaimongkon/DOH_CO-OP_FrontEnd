// Bank Account feature types

import {
  BaseApiService,
  BaseService,
  BaseError,
  BaseClientProps,
  BaseApiResponse,
  ClientSectionConfig,
  ClientSectionUIText,
  ClientSectionErrorMessages,
  ClientSectionSuccessMessages,
  ClientSectionImageConfig,
  LoadingState,
  BaseFilters,
  BaseSearchOptions,
  createBaseError,
  mapBaseApiServiceToService,
  filterBaseServices,
  BASE_ERROR_MESSAGES,
  BASE_SUCCESS_MESSAGES,
  BASE_UI_TEXT,
  DEFAULT_IMAGE_CONFIG,
  CLIENT_SECTION_CONSTANTS,
} from './client-sections';

// Bank Account API service extends base with specific fields
export type BankAccountApiService = BaseApiService;

// Bank Account service extends base service
export type BankAccountService = BaseService;

// Component props extending base client props
export type BankAccountClientProps = BaseClientProps<BankAccountService>;

// API response extending base response
export type BankAccountApiResponse<T = unknown> = BaseApiResponse<T>;

// Error extending base error
export type BankAccountError = BaseError;

// Loading states using base loading state
export type BankAccountLoadingState = LoadingState;

// Filters extending base filters
export type BankAccountFilters = BaseFilters;

// Search options extending base search options
export interface BankAccountSearchOptions extends BaseSearchOptions {
  filters?: BankAccountFilters;
  sortBy?: keyof BankAccountService;
}

// Bank Account configuration extending base config
export const BANK_ACCOUNT_CONFIG: ClientSectionConfig = {
  subcategoryFilter: 'บัญชีธนาคารสหกรณ์',
  defaultCacheTime: CLIENT_SECTION_CONSTANTS.DEFAULT_CACHE_TIME,
  maxRetryAttempts: CLIENT_SECTION_CONSTANTS.MAX_RETRY_ATTEMPTS,
  retryDelay: CLIENT_SECTION_CONSTANTS.RETRY_DELAY,
  apiEndpoint: '/Serve',
} as const;

// API endpoints
export const BANK_ACCOUNT_ENDPOINTS = {
  SERVICES: BANK_ACCOUNT_CONFIG.apiEndpoint,
  SERVICE_BY_ID: (id: number) => `${BANK_ACCOUNT_CONFIG.apiEndpoint}/${id}`,
} as const;

// Bank Account error messages extending base messages
export const BANK_ACCOUNT_ERROR_MESSAGES: ClientSectionErrorMessages = {
  ...BASE_ERROR_MESSAGES,
  fetchError: 'ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้',
} as const;

// Bank Account success messages extending base messages
export const BANK_ACCOUNT_SUCCESS_MESSAGES: ClientSectionSuccessMessages = {
  ...BASE_SUCCESS_MESSAGES,
} as const;

// Bank Account UI text extending base text
export const BANK_ACCOUNT_UI_TEXT: ClientSectionUIText = {
  ...BASE_UI_TEXT,
  loadingText: 'กำลังโหลดข้อมูลบัญชีธนาคาร...',
  emptyTitle: 'ไม่พบข้อมูลบัญชีธนาคาร',
  emptyDescription: 'ไม่มีข้อมูลบัญชีธนาคารสหกรณ์ที่จะแสดง',
  pageTitle: 'ข้อมูลบัญชีธนาคารสหกรณ์',
} as const;

// Bank Account image config using base config
export const BANK_ACCOUNT_IMAGE_CONFIG: ClientSectionImageConfig = {
  ...DEFAULT_IMAGE_CONFIG,
  // Override specific settings if needed
} as const;

// Helper functions using base utilities
export const createBankAccountError = (
  message: string,
  code?: string,
  context?: Record<string, unknown>
): BankAccountError => createBaseError(message, code, context);

export const mapApiServiceToService = (
  apiService: BankAccountApiService,
  fileUrl: string
): BankAccountService => mapBaseApiServiceToService(apiService, fileUrl);

export const filterBankAccountServices = (
  services: BankAccountService[],
  filters?: BankAccountFilters
): BankAccountService[] => filterBaseServices(services, filters);

// Validation functions using base type guards
export const validateBankAccountService = (service: unknown): service is BankAccountService => {
  // Use base validation and add any bank account specific validation if needed
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

export const validateBankAccountApiResponse = (response: unknown): response is BankAccountApiResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as Record<string, unknown>).success === 'boolean'
  );
};

// Type guards extending base type guards
export const isBankAccountError = (error: unknown): error is BankAccountError => {
  // Could use isBaseError from client-sections, but keeping specific implementation
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};