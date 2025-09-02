"use client";
import React, { memo } from "react";
import { useDownloadForms } from "@/hooks/useDownloadForms";
import { DownloadFormPage } from "@/components/DownloadFormPage";
import "../DownloadForm.css";

const Welfare: React.FC = memo(function Welfare() {
  const { 
    loading, 
    error, 
    groupedForms, 
    handlePdfClick, 
    refetch, 
    formLabel 
  } = useDownloadForms(
    "แบบฟอร์มขอรับสวัสดิการ",
    "แบบฟอร์มสวัสดิการ"
  );

  return (
    <DownloadFormPage
      loading={loading}
      error={error}
      groupedForms={groupedForms}
      onPdfClick={handlePdfClick}
      onRefetch={refetch}
      formLabel={formLabel}
    />
  );
});

export default Welfare;
