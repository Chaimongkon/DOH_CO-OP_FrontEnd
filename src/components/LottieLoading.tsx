"use client";
import React from "react";
import Lottie from "lottie-react";
import { createStyles } from "antd-style";
import { Fade } from "@mui/material";

// Import loading animations
import * as loadingAnimation from "@/app/loading.json";

interface LottieLoadingProps {
  size?: "small" | "default" | "large";
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "overlay" | "page" | "inline";
  className?: string;
  animationData?: object;
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(8px)",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(4px)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: token.borderRadius,
    backdropFilter: "blur(2px)",
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
    textAlign: "center",
  },
  loadingText: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: 500,
    textAlign: "center",
    marginTop: token.marginSM,
    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  lottieContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
  },
  fadeTransition: {
    transition: "all 0.3s ease-in-out",
  },
}));

// Get animation size based on size prop
const getAnimationSize = (size: "small" | "default" | "large") => {
  switch (size) {
    case "small":
      return { height: 60, width: 60 };
    case "large":
      return { height: 120, width: 120 };
    default:
      return { height: 80, width: 80 };
  }
};

/**
 * Enhanced Lottie Loading Component
 * 
 * Features:
 * - Beautiful Lottie animations instead of basic spinners
 * - Multiple variants for different use cases
 * - Smooth fade transitions
 * - Customizable animations and styling
 * - Better visual feedback for users
 * 
 * Variants:
 * - default: Standard section loading with backdrop
 * - overlay: Absolute positioned overlay for containers
 * - page: Full screen loading overlay
 * - inline: Inline loading for buttons/small areas
 */
const LottieLoading: React.FC<LottieLoadingProps> = ({
  size = "default",
  tip,
  spinning = true,
  children,
  variant = "default",
  className = "",
  animationData = loadingAnimation,
}) => {
  const { styles, cx } = useStyles();
  const animationSize = getAnimationSize(size);

  // Don't render if not spinning
  if (!spinning) {
    return <>{children}</>;
  }

  const lottieElement = (
    <div className={styles.lottieContainer}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={animationSize}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
    </div>
  );

  const loadingContent = (
    <div className={styles.loadingContent}>
      {lottieElement}
      {tip && <div className={styles.loadingText}>{tip}</div>}
    </div>
  );

  const wrappedContent = (
    <Fade in={spinning} timeout={300}>
      <div className={styles.fadeTransition}>
        {loadingContent}
      </div>
    </Fade>
  );

  switch (variant) {
    case "page":
      return (
        <div className={cx(styles.pageLoading, className)}>
          {wrappedContent}
        </div>
      );

    case "overlay":
      return (
        <div style={{ position: "relative" }}>
          {children}
          <div className={cx(styles.overlayLoading, className)}>
            {wrappedContent}
          </div>
        </div>
      );

    case "inline":
      return (
        <div className={cx(styles.inlineLoading, className)}>
          {lottieElement}
          {tip && <span className={styles.loadingText}>{tip}</span>}
        </div>
      );

    default:
      return (
        <div className={cx(styles.sectionLoading, className)}>
          {wrappedContent}
        </div>
      );
  }
};

// Predefined Lottie loading components for common use cases
export const LottiePageLoading: React.FC<{ 
  tip?: string; 
  animationData?: object;
}> = ({ 
  tip = "Loading...", 
  animationData = loadingAnimation,
}) => (
  <LottieLoading 
    variant="page" 
    tip={tip} 
    size="large" 
    animationData={animationData}
  />
);

export const LottieSectionLoading: React.FC<{ 
  tip?: string; 
  className?: string;
  animationData?: object;
}> = ({ 
  tip = "Loading...", 
  className,
  animationData = loadingAnimation,
}) => (
  <LottieLoading 
    variant="default" 
    tip={tip} 
    size="default" 
    className={className}
    animationData={animationData}
  />
);

export const LottieInlineLoading: React.FC<{ 
  tip?: string; 
  size?: "small" | "default";
  animationData?: object;
}> = ({ 
  tip, 
  size = "small",
  animationData = loadingAnimation,
}) => (
  <LottieLoading 
    variant="inline" 
    tip={tip} 
    size={size}
    animationData={animationData}
  />
);

export const LottieOverlayLoading: React.FC<{ 
  children: React.ReactNode; 
  spinning: boolean; 
  tip?: string;
  animationData?: object;
}> = ({ 
  children, 
  spinning, 
  tip = "Loading...",
  animationData = loadingAnimation,
}) => (
  <LottieLoading 
    variant="overlay" 
    spinning={spinning} 
    tip={tip}
    animationData={animationData}
  >
    {children}
  </LottieLoading>
);

export default LottieLoading;