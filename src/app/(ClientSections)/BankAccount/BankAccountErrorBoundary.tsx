"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "antd";
import logger from "@/lib/logger";
import { 
  BankAccountError, 
  BANK_ACCOUNT_ERROR_MESSAGES,
  createBankAccountError 
} from "@/types/bank-account";
import styles from "./BankAccount.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: BankAccountError;
}

export default class BankAccountErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: createBankAccountError(
        error.message || BANK_ACCOUNT_ERROR_MESSAGES.serverError,
        'COMPONENT_ERROR'
      ),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    logger.error('BankAccount Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            </div>
            <h2 className={styles.errorTitle}>
              เกิดข้อผิดพลาดในการแสดงผล
            </h2>
            <p className={styles.errorMessage}>
              {this.state.error?.message || BANK_ACCOUNT_ERROR_MESSAGES.serverError}
            </p>
            <div className={styles.errorActions}>
              <Button 
                type="primary" 
                onClick={this.handleRetry}
                className={styles.retryButton}
              >
                <i className="fas fa-redo" aria-hidden="true"></i>
                ลองใหม่อีกครั้ง
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className={styles.refreshButton}
              >
                <i className="fas fa-refresh" aria-hidden="true"></i>
                รีเฟรชหน้า
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>รายละเอียดข้อผิดพลาด (Development)</summary>
                <pre className={styles.errorStack}>
                  {JSON.stringify(this.state.error, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}