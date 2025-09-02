import React, { Component, ErrorInfo, ReactNode } from 'react';
import { message } from 'antd';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class InstallErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Install component error:', { error: error.message, stack: error.stack, errorInfo });
    message.error('เกิดข้อผิดพลาดในการแสดงผลหน้าการติดตั้ง');
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="py-5">
          <div className="container py-4">
            <div className="text-center">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
                <p>
                  ไม่สามารถแสดงหน้าคู่มือการติดตั้งได้ในขณะนี้
                </p>
                <hr />
                <p className="mb-0">
                  <button 
                    className="btn btn-primary me-2" 
                    onClick={this.handleRetry}
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => window.history.back()}
                  >
                    กลับหน้าก่อนหน้า
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default InstallErrorBoundary;