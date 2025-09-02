"use client";
import React from "react";
import { Alert, Empty, Button } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { SectionLoading } from "./loading";

interface DataStatesProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingText?: string;
  emptyText?: string;
  emptyDescription?: string;
  className?: string;
}

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.paddingLG,
    borderRadius: token.borderRadius,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: token.marginMD,
    padding: token.paddingXL,
    textAlign: "center",
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: token.paddingXL,
    minHeight: "200px",
    justifyContent: "center",
  },
  retryButton: {
    marginTop: token.marginMD,
  },
}));

/**
 * Unified component for handling loading, error, and empty states
 */
const DataStates: React.FC<DataStatesProps> = ({
  loading = false,
  error = null,
  isEmpty = false,
  onRetry,
  children,
  loadingText = "กำลังโหลด...",
  emptyText = "ไม่พบข้อมูล",
  emptyDescription = "ไม่มีข้อมูลที่จะแสดงในขณะนี้",
  className = "",
}) => {
  const { styles, cx } = useStyles();

  // Loading state
  if (loading) {
    return (
      <div className={cx(styles.container, className)}>
        <SectionLoading tip={loadingText} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cx(styles.container, styles.errorContainer, className)}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
        {onRetry && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRetry}
            className={styles.retryButton}
          >
            ลองใหม่
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={cx(styles.container, styles.emptyContainer, className)}>
        <Empty
          description={
            <div>
              <div>{emptyText}</div>
              <div style={{ fontSize: "14px", color: "#8c8c8c", marginTop: "8px" }}>
                {emptyDescription}
              </div>
            </div>
          }
        />
        {onRetry && (
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={onRetry}
            className={styles.retryButton}
          >
            รีเฟรช
          </Button>
        )}
      </div>
    );
  }

  // Success state - render children
  return <>{children}</>;
};

export default DataStates;