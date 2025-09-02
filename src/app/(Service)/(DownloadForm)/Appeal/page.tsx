"use client";
import React, { memo } from "react";
import { useDownloadForms } from "@/hooks/useDownloadForms";
import { DownloadFormPage } from "@/components/DownloadFormPage";
import "../DownloadForm.css";

const Appeal: React.FC = memo(function Appeal() {
  const { 
    loading, 
    error, 
    groupedForms, 
    handlePdfClick, 
    refetch, 
    formLabel 
  } = useDownloadForms(
    "แบบฟอร์มหนังสือร้องทุกข์ / ร้องเรียน",
    "แบบฟอร์มร้องทุกข์/ร้องเรียน"
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

export default Appeal;