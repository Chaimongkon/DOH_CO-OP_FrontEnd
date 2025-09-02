"use client";
import React, { memo } from "react";
import { useDownloadForms } from "@/hooks/useDownloadForms";
import { DownloadFormPage } from "@/components/DownloadFormPage";
import "../DownloadForm.css";

const Other: React.FC = memo(function Other() {
  const { 
    loading, 
    error, 
    groupedForms, 
    handlePdfClick, 
    refetch, 
    formLabel 
  } = useDownloadForms(
    "แบบฟอร์มอื่น ๆ",
    "แบบฟอร์มอื่นๆ"
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

export default Other;