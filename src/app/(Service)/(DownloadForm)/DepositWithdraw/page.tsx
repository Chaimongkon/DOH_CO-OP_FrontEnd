"use client";
import React, { memo } from "react";
import { useDownloadForms } from "@/hooks/useDownloadForms";
import { DownloadFormPage } from "@/components/DownloadFormPage";
import "../DownloadForm.css";

const DepositWithdraw: React.FC = memo(function DepositWithdraw() {
  const { 
    loading, 
    error, 
    groupedForms, 
    handlePdfClick, 
    refetch, 
    formLabel 
  } = useDownloadForms(
    "แบบฟอร์มเงินฝาก - ถอน",
    "แบบฟอร์มเงินฝาก-ถอน"
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

export default DepositWithdraw;