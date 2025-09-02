// Export all ClientSection components

export { default as LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';
export {
  CardLoadingState,
  ListLoadingState,
  TableLoadingState,
  FullPageLoadingState,
} from './LoadingState';

export { default as ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';
export {
  NetworkErrorState,
  ServerErrorState,
  NotFoundErrorState,
  UnauthorizedErrorState,
  TimeoutErrorState,
  CompactErrorState,
  ErrorBoundaryFallback,
} from './ErrorState';

// Re-export types for convenience
export type {
  BaseError,
  BaseService,
  BaseApiResponse,
  BaseClientProps,
  ClientSectionConfig,
  ClientSectionUIText,
  ClientSectionErrorMessages,
  ClientSectionSuccessMessages,
  LoadingState as LoadingStateType,
  BaseFilters,
  BaseSearchOptions,
} from '@/types/client-sections';