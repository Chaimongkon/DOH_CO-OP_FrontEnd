"use client";

import { lazy, Suspense } from "react";
import { Skeleton } from "antd";
import { LottieSectionLoading } from "@/components/LottieLoading";

/**
 * Dynamic imports for heavy components to improve initial bundle size
 * These components are loaded on-demand when needed
 */

// Complex form components with heavy UI libraries
export const LazyComplaintDialog = lazy(() => import("@/app/(ClientSections)/Complaint/ComplaintDialog"));
export const LazyContactForm = lazy(() => import("@/app/Contact/ContactClient"));

// Heavy data visualization components
export const LazyBusinessReport = lazy(() => import("@/app/(OperatingResults)/BusinessReport/page"));
export const LazyAssetsLiabilities = lazy(() => import("@/app/(OperatingResults)/AssetsAndLiabilities/page"));

// Rich content components with media
export const LazyElectionDepartment = lazy(() => import("@/app/(Home)/ElectionDepartment/page"));
export const LazyElectionVideos = lazy(() => import("@/app/(Home)/(Election)/ElectionVideos/page"));

// Interactive components with complex state
export const LazyPhotoGallery = lazy(() => import("@/app/(Home)/(PhotoVideoInterest)/ShowAllPhotos/[id]/page"));

/**
 * Loading fallback components optimized for different use cases
 */
export const FormLoading = () => (
  <div style={{ padding: "24px", textAlign: "center" }}>
    <Skeleton active avatar paragraph={{ rows: 4 }} />
  </div>
);

export const ReportLoading = () => (
  <div style={{ padding: "20px" }}>
    <Skeleton active paragraph={{ rows: 8 }} />
    <br />
    <Skeleton.Button active size="large" style={{ width: "200px" }} />
  </div>
);

export const MediaLoading = () => (
  <LottieSectionLoading tip="กำลังโหลดเนื้อหา..." />
);

/**
 * Wrapper components with proper loading states
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyComplaintDialogWrapper = (props: any) => (
  <Suspense fallback={<FormLoading />}>
    <LazyComplaintDialog {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyContactFormWrapper = (props: any) => (
  <Suspense fallback={<FormLoading />}>
    <LazyContactForm {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyBusinessReportWrapper = (props: any) => (
  <Suspense fallback={<ReportLoading />}>
    <LazyBusinessReport {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyAssetsLiabilitiesWrapper = (props: any) => (
  <Suspense fallback={<ReportLoading />}>
    <LazyAssetsLiabilities {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyElectionDepartmentWrapper = (props: any) => (
  <Suspense fallback={<MediaLoading />}>
    <LazyElectionDepartment {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyElectionVideosWrapper = (props: any) => (
  <Suspense fallback={<MediaLoading />}>
    <LazyElectionVideos {...props} />
  </Suspense>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LazyPhotoGalleryWrapper = (props: any) => (
  <Suspense fallback={<MediaLoading />}>
    <LazyPhotoGallery {...props} />
  </Suspense>
);

/**
 * Bundle splitting configuration for webpack
 * These exports help webpack understand which components can be split
 */
export const LazyComponentMap = {
  // Form components (heavy UI libraries)
  ComplaintDialog: LazyComplaintDialogWrapper,
  ContactForm: LazyContactFormWrapper,
  
  // Report components (data processing)
  BusinessReport: LazyBusinessReportWrapper,
  AssetsLiabilities: LazyAssetsLiabilitiesWrapper,
  
  // Media components (rich content)
  ElectionDepartment: LazyElectionDepartmentWrapper,
  ElectionVideos: LazyElectionVideosWrapper,
  PhotoGallery: LazyPhotoGalleryWrapper,
};