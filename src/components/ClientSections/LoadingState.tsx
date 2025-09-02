"use client";

import React from 'react';
import { Skeleton } from 'antd';
import { BASE_UI_TEXT } from '@/types/client-sections';
import styles from './ClientSectionStates.module.css';

export interface LoadingStateProps {
  /**
   * Loading text to display
   */
  text?: string;
  
  /**
   * Number of skeleton items to show
   */
  rows?: number;
  
  /**
   * Show image skeleton
   */
  showImage?: boolean;
  
  /**
   * Show avatar skeleton
   */
  showAvatar?: boolean;
  
  /**
   * Size of the loading state
   */
  size?: 'small' | 'default' | 'large';
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Loading variant
   */
  variant?: 'skeleton' | 'spinner' | 'pulse' | 'shimmer';
}

/**
 * Reusable loading state component for ClientSections
 */
export default function LoadingState({
  text = BASE_UI_TEXT.loadingText,
  rows = 3,
  showImage = true,
  showAvatar = false,
  size = 'default',
  className = '',
  variant = 'skeleton',
}: LoadingStateProps) {
  const containerClass = [
    styles.loadingContainer,
    styles[size],
    className
  ].filter(Boolean).join(' ');

  if (variant === 'spinner') {
    return (
      <div className={containerClass} role="status" aria-live="polite">
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner} aria-hidden="true">
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
          <p className={styles.loadingText}>{text}</p>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={containerClass} role="status" aria-live="polite">
        <div className={styles.pulseWrapper}>
          {showImage && (
            <div className={styles.pulseImage} aria-hidden="true"></div>
          )}
          <div className={styles.pulseContent}>
            {Array.from({ length: rows }).map((_, index) => (
              <div 
                key={index} 
                className={styles.pulseLine}
                style={{ 
                  width: index === rows - 1 ? '70%' : '100%',
                  animationDelay: `${index * 0.1}s`
                }}
                aria-hidden="true"
              ></div>
            ))}
          </div>
        </div>
        <p className={styles.loadingText}>{text}</p>
      </div>
    );
  }

  if (variant === 'shimmer') {
    return (
      <div className={containerClass} role="status" aria-live="polite">
        <div className={styles.shimmerWrapper}>
          {showImage && (
            <div className={styles.shimmerImage} aria-hidden="true">
              <div className={styles.shimmerEffect}></div>
            </div>
          )}
          <div className={styles.shimmerContent}>
            {Array.from({ length: rows }).map((_, index) => (
              <div 
                key={index} 
                className={styles.shimmerLine}
                style={{ 
                  width: index === rows - 1 ? '60%' : '100%',
                }}
                aria-hidden="true"
              >
                <div className={styles.shimmerEffect}></div>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.loadingText}>{text}</p>
      </div>
    );
  }

  // Default: Skeleton variant
  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={styles.skeletonWrapper}>
        <Skeleton
          loading={true}
          active
          avatar={showAvatar}
          paragraph={{ 
            rows,
            width: Array.from({ length: rows }, (_, index) => 
              index === rows - 1 ? '70%' : '100%'
            )
          }}
        >
          {/* This content is hidden when loading */}
          <div></div>
        </Skeleton>
        {showImage && (
          <div className={styles.skeletonImageWrapper}>
            <Skeleton.Image 
              active 
              className={styles.skeletonImage}
            />
          </div>
        )}
      </div>
      <div className={styles.loadingTextWrapper}>
        <span className={styles.loadingText}>{text}</span>
        <div className={styles.loadingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Specialized loading states for different use cases
 */

export function CardLoadingState(props: Omit<LoadingStateProps, 'variant'>) {
  return (
    <div className={styles.cardLoading}>
      <LoadingState {...props} variant="shimmer" showImage={true} rows={2} />
    </div>
  );
}

export function ListLoadingState(props: Omit<LoadingStateProps, 'variant'>) {
  return (
    <div className={styles.listLoading}>
      {Array.from({ length: props.rows || 3 }).map((_, index) => (
        <div key={index} className={styles.listItem}>
          <LoadingState 
            {...props} 
            variant="pulse" 
            showImage={false} 
            showAvatar={true} 
            rows={1} 
          />
        </div>
      ))}
    </div>
  );
}

export function TableLoadingState(props: Omit<LoadingStateProps, 'variant'>) {
  return (
    <div className={styles.tableLoading}>
      <LoadingState 
        {...props} 
        variant="skeleton" 
        showImage={false} 
        rows={5}
      />
    </div>
  );
}

export function FullPageLoadingState(props: LoadingStateProps) {
  return (
    <div className={styles.fullPageLoading}>
      <div className={styles.fullPageContent}>
        <LoadingState 
          {...props} 
          variant="spinner" 
          size="large"
        />
      </div>
    </div>
  );
}