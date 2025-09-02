"use client";
import React, { memo } from "react";
import { useDownloadForms } from "@/hooks/useDownloadForms";
import { DownloadFormPage } from "@/components/DownloadFormPage";
import "../DownloadForm.css";

const Beneficiary: React.FC = memo(function Beneficiary() {
  const { 
    loading, 
    error, 
    groupedForms, 
    handlePdfClick, 
    refetch, 
    formLabel 
  } = useDownloadForms(
    "หนังสือแต่งตั้งผู้รับโอนประโยชน์",
    "หนังสือแต่งตั้งผู้รับโอนประโยชน์"
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

export default Beneficiary;