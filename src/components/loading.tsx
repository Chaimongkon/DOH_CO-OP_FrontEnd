"use client";
import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { LottieSectionLoading, LottiePageLoading, LottieInlineLoading, LottieOverlayLoading } from "@/components/LottieLoading";

interface LoadingProps {
  size?: "small" | "default" | "large";
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "overlay" | "page" | "inline";
  className?: string;
}

const useStyles = createStyles(({ token }) => ({
  pageLoading: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(4px)",
    zIndex: 9999,
  },
  overlayLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(2px)",
    borderRadius: token.borderRadius,
    zIndex: 1000,
  },
  sectionLoading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: `${token.paddingXL}px`,
    minHeight: "200px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: token.borderRadius,
    backdropFilter: "blur(1px)",
  },
  inlineLoading: {
    display: "inline-flex",
    alignItems: "center",
    gap: token.marginSM,
  },
  loadingContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: token.marginMD,
  },
  loadingText: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: 500,
    textAlign: "center",
  },
  spinner: {
    "& .ant-spin-dot": {
      fontSize: "24px",
    },
    "& .ant-spin-dot-item": {
      backgroundColor: token.colorPrimary,
    },
  },
  pulseEffect: {
    animation: "pulse 1.5s ease-in-out infinite",
    "@keyframes pulse": {
      "0%": {
        opacity: 1,
      },
      "50%": {
        opacity: 0.6,
      },
      "100%": {
        opacity: 1,
      },
    },
  },
}));

// Custom spinning icon with animation
const CustomLoadingIcon = () => (
  <LoadingOutlined
    style={{
      fontSize: 24,
      color: "#1890ff",
    }}
    spin
  />
);

/**
 * Enhanced Loading Component
 * 
 * Variants:
 * - default: Standard section loading
 * - overlay: Absolute positioned overlay for containers
 * - page: Full screen loading overlay
 * - inline: Inline loading for buttons/small areas
 */
const Loading: React.FC<LoadingProps> = ({
  size = "default",
  tip,
  spinning = true,
  children,
  variant = "default",
  className = "",
}) => {
  const { styles, cx } = useStyles();

  // Don't render if not spinning
  if (!spinning) {
    return <>{children}</>;
  }

  const spinElement = (
    <Spin
      size={size}
      tip={tip}
      indicator={<CustomLoadingIcon />}
      className={cx(styles.spinner, styles.pulseEffect)}
    />
  );

  const loadingContent = (
    <div className={styles.loadingContent}>
      {spinElement}
      {tip && <div className={styles.loadingText}>{tip}</div>}
    </div>
  );

  switch (variant) {
    case "page":
      return (
        <div className={cx(styles.pageLoading, className)}>
          {loadingContent}
        </div>
      );

    case "overlay":
      return (
        <div style={{ position: "relative" }}>
          {children}
          <div className={cx(styles.overlayLoading, className)}>
            {loadingContent}
          </div>
        </div>
      );

    case "inline":
      return (
        <div className={cx(styles.inlineLoading, className)}>
          {spinElement}
          {tip && <span className={styles.loadingText}>{tip}</span>}
        </div>
      );

    default:
      return (
        <div className={cx(styles.sectionLoading, className)}>
          {loadingContent}
        </div>
      );
  }
};

// Enhanced Lottie-based loading components (recommended)
export const PageLoading: React.FC<{ tip?: string; useLottie?: boolean }> = ({ 
  tip = "Loading...", 
  useLottie = true 
}) => (
  useLottie ? (
    <LottiePageLoading tip={tip} />
  ) : (
    <Loading variant="page" tip={tip} size="large" />
  )
);

export const SectionLoading: React.FC<{ 
  tip?: string; 
  className?: string; 
  useLottie?: boolean;
}> = ({ 
  tip = "Loading...", 
  className,
  useLottie = true
}) => (
  useLottie ? (
    <LottieSectionLoading tip={tip} className={className} />
  ) : (
    <Loading variant="default" tip={tip} size="default" className={className} />
  )
);

export const InlineLoading: React.FC<{ 
  tip?: string; 
  size?: "small" | "default";
  useLottie?: boolean;
}> = ({ 
  tip, 
  size = "small",
  useLottie = true
}) => (
  useLottie ? (
    <LottieInlineLoading tip={tip} size={size} />
  ) : (
    <Loading variant="inline" tip={tip} size={size} />
  )
);

export const OverlayLoading: React.FC<{ 
  children: React.ReactNode; 
  spinning: boolean; 
  tip?: string;
  useLottie?: boolean;
}> = ({ children, spinning, tip = "Loading...", useLottie = true }) => (
  useLottie ? (
    <LottieOverlayLoading spinning={spinning} tip={tip}>
      {children}
    </LottieOverlayLoading>
  ) : (
    <Loading variant="overlay" spinning={spinning} tip={tip}>
      {children}
    </Loading>
  )
);

export default Loading;