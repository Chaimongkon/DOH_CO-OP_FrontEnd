"use client";

import React from 'react';
import { Button, Result } from 'antd';
import { 
  BASE_ERROR_MESSAGES, 
  BASE_UI_TEXT,
  BaseError,
  isBaseError,
} from '@/types/client-sections';
import logger from '@/lib/logger';
import styles from './ClientSectionStates.module.css';

export interface ErrorStateProps {
  /**
   * Error object or message
   */
  error?: BaseError | string | null;
  
  /**
   * Retry callback function
   */
  onRetry?: () => void;
  
  /**
   * Refresh callback function (typically page reload)
   */
  onRefresh?: () => void;
  
  /**
   * Custom title for error
   */
  title?: string;
  
  /**
   * Custom description for error
   */
  description?: string;
  
  /**
   * Error variant/type
   */
  variant?: 'network' | 'server' | 'notFound' | 'unauthorized' | 'timeout' | 'general';
  
  /**
   * Size of the error state
   */
  size?: 'small' | 'default' | 'large';
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Show refresh button
   */
  showRefresh?: boolean;
  
  /**
   * Show retry button
   */
  showRetry?: boolean;
  
  /**
   * Show error details in development
   */
  showDetails?: boolean;
  
  /**
   * Custom actions to show
   */
  actions?: React.ReactNode;
}

/**
 * Reusable error state component for ClientSections
 */
export default function ErrorState({
  error,
  onRetry,
  onRefresh,
  title,
  description,
  variant = 'general',
  size = 'default',
  className = '',
  showRefresh = true,
  showRetry = true,
  showDetails = process.env.NODE_ENV === 'development',
  actions,
}: ErrorStateProps) {
  
  // Extract error information
  const errorMessage = React.useMemo(() => {
    if (!error) return BASE_ERROR_MESSAGES.serverError;
    if (typeof error === 'string') return error;
    if (isBaseError(error)) return error.message;
    return BASE_ERROR_MESSAGES.serverError;
  }, [error]);

  const errorCode = React.useMemo(() => {
    if (isBaseError(error)) return error.code;
    return undefined;
  }, [error]);

  // Determine error variant based on error code or message
  const effectiveVariant = React.useMemo(() => {
    if (variant !== 'general') return variant;
    
    const message = errorMessage.toLowerCase();
    if (message.includes('network') || message.includes('เชื่อมต่อ')) return 'network';
    if (message.includes('server') || message.includes('เซิร์ฟเวอร์')) return 'server';
    if (message.includes('not found') || message.includes('ไม่พบ')) return 'notFound';
    if (message.includes('unauthorized') || message.includes('สิทธิ์')) return 'unauthorized';
    if (message.includes('timeout') || message.includes('หมดเวลา')) return 'timeout';
    
    return 'general';
  }, [variant, errorMessage]);

  // Get appropriate icon and status
  const getErrorConfig = (errorVariant: typeof effectiveVariant) => {
    switch (errorVariant) {
      case 'network':
        return {
          status: 'error' as const,
          icon: '📡',
          defaultTitle: 'ปัญหาการเชื่อมต่อ',
          defaultDescription: BASE_ERROR_MESSAGES.networkError,
        };
      case 'server':
        return {
          status: '500' as const,
          icon: '🔧',
          defaultTitle: 'ข้อผิดพลาดจากเซิร์ฟเวอร์',
          defaultDescription: BASE_ERROR_MESSAGES.serverError,
        };
      case 'notFound':
        return {
          status: '404' as const,
          icon: '🔍',
          defaultTitle: 'ไม่พบข้อมูล',
          defaultDescription: BASE_ERROR_MESSAGES.notFound,
        };
      case 'unauthorized':
        return {
          status: '403' as const,
          icon: '🔒',
          defaultTitle: 'ไม่มีสิทธิ์เข้าถึง',
          defaultDescription: BASE_ERROR_MESSAGES.unauthorized,
        };
      case 'timeout':
        return {
          status: 'error' as const,
          icon: '⏰',
          defaultTitle: 'การเชื่อมต่อหมดเวลา',
          defaultDescription: BASE_ERROR_MESSAGES.timeout,
        };
      default:
        return {
          status: 'error' as const,
          icon: '⚠️',
          defaultTitle: 'เกิดข้อผิดพลาด',
          defaultDescription: errorMessage,
        };
    }
  };

  const config = getErrorConfig(effectiveVariant);

  const handleRetry = React.useCallback(() => {
    if (onRetry) {
      logger.info('User initiated retry', { errorCode, variant: effectiveVariant });
      onRetry();
    }
  }, [onRetry, errorCode, effectiveVariant]);

  const handleRefresh = React.useCallback(() => {
    if (onRefresh) {
      logger.info('User initiated refresh', { errorCode, variant: effectiveVariant });
      onRefresh();
    } else {
      window.location.reload();
    }
  }, [onRefresh, errorCode, effectiveVariant]);

  const renderActions = () => {
    if (actions) return actions;
    
    const defaultActions = [];
    
    if (showRetry && onRetry) {
      defaultActions.push(
        <Button 
          key="retry"
          type="primary" 
          onClick={handleRetry}
          className={styles.retryButton}
          icon={<span className={styles.buttonIcon}>🔄</span>}
        >
          {BASE_UI_TEXT.retryButton}
        </Button>
      );
    }
    
    if (showRefresh) {
      defaultActions.push(
        <Button 
          key="refresh"
          onClick={handleRefresh}
          className={styles.refreshButton}
          icon={<span className={styles.buttonIcon}>↻</span>}
        >
          รีเฟรชหน้า
        </Button>
      );
    }
    
    return defaultActions;
  };

  const containerClass = [
    styles.errorContainer,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} role="alert">
      <Result
        status={config.status}
        icon={<span className={styles.errorIcon}>{config.icon}</span>}
        title={
          <span className={styles.errorTitle}>
            {title || config.defaultTitle}
          </span>
        }
        subTitle={
          <div className={styles.errorDescription}>
            <p>{description || config.defaultDescription}</p>
            {errorCode && (
              <p className={styles.errorCode}>
                รหัสข้อผิดพลาด: {errorCode}
              </p>
            )}
          </div>
        }
        extra={
          <div className={styles.errorActions}>
            {renderActions()}
          </div>
        }
      />
      
      {/* Development error details */}
      {showDetails && isBaseError(error) && (
        <details className={styles.errorDetails}>
          <summary className={styles.errorDetailsSummary}>
            รายละเอียดข้อผิดพลาด (Development)
          </summary>
          <div className={styles.errorDetailsContent}>
            <pre className={styles.errorStack}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Specialized error states for different use cases
 */

export function NetworkErrorState(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState {...props} variant="network" />;
}

export function ServerErrorState(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState {...props} variant="server" />;
}

export function NotFoundErrorState(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState {...props} variant="notFound" />;
}

export function UnauthorizedErrorState(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState {...props} variant="unauthorized" />;
}

export function TimeoutErrorState(props: Omit<ErrorStateProps, 'variant'>) {
  return <ErrorState {...props} variant="timeout" />;
}

/**
 * Compact error state for inline usage
 */
export function CompactErrorState({
  error,
  onRetry,
  className = '',
}: Pick<ErrorStateProps, 'error' | 'onRetry' | 'className'>) {
  const errorMessage = typeof error === 'string' ? error : 
    (isBaseError(error) ? error.message : BASE_ERROR_MESSAGES.serverError);

  return (
    <div className={`${styles.compactError} ${className}`} role="alert">
      <div className={styles.compactErrorContent}>
        <span className={styles.compactErrorIcon}>⚠️</span>
        <span className={styles.compactErrorMessage}>{errorMessage}</span>
        {onRetry && (
          <Button 
            size="small" 
            type="link" 
            onClick={onRetry}
            className={styles.compactRetryButton}
          >
            ลองใหม่
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Error boundary fallback component
 */
export function ErrorBoundaryFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  React.useEffect(() => {
    logger.error('ErrorBoundary caught an error:', error);
  }, [error]);

  return (
    <ErrorState
      error={{
        message: error.message,
        code: 'BOUNDARY_ERROR',
        timestamp: new Date().toISOString(),
        context: { stack: error.stack },
      }}
      onRetry={resetError}
      title="เกิดข้อผิดพลาดในการแสดงผล"
      description="ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"
      size="large"
      showDetails={true}
    />
  );
}