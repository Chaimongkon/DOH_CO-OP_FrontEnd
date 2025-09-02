"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="error"
          title="เกิดข้อผิดพลาดในการโหลดข้อมูล"
          subTitle="กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่"
          extra={[
            <Button 
              type="primary" 
              key="retry"
              onClick={() => window.location.reload()}
            >
              โหลดใหม่
            </Button>,
            <Button 
              key="home"
              onClick={() => window.location.href = '/'}
            >
              กลับหน้าหลัก
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}