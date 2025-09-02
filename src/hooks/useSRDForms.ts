import { useState, useCallback, useEffect } from "react";
import { DownloadForm, SRDFormData } from "@/types";
import { message } from "antd";
import { useApiConfig } from "@/hooks/useApiConfig";
import { apiRequest } from "@/utils/api";
import { groupFormsByMember } from "@/utils/srd-helpers";
import logger from "@/lib/logger";

/**
 * Custom hook for fetching and managing SRD forms
 * @param typeForm - The type of form to filter by (ประกาศ, ระเบียบ, ข้อบังคับ)
 * @returns Object with forms data, loading state, error state, and grouped forms
 */
export const useSRDForms = (typeForm: string) => {
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getImageUrl, getApiUrl } = useApiConfig();

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest(getApiUrl('SRD'));
      const data = response.data || response;
      const processedData = (data as SRDFormData[])
        .filter((form) => form.TypeForm === typeForm)
        .map((form) => {
          return {
            id: form.Id,
            title: form.Title,
            typeForm: form.TypeForm,
            typeMember: form.TypeMember,
            filePath: getImageUrl(form.FilePath),
            pdffile: getImageUrl(form.FilePath),
            File: form.FilePath || "",
            createDate: form.CreateDate,
          };
        });
      setForms(processedData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch download forms";
      setError(errorMessage);
      logger.error("Failed to fetch forms:", error);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, getImageUrl, typeForm]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const groupedForms = groupFormsByMember(forms);

  const handlePdfClick = useCallback((formItem: DownloadForm) => {
    if (formItem.pdffile) {
      window.open(formItem.pdffile, "_blank");
    } else {
      message.error(`ไม่มีไฟล์ ${formItem.title}`);
    }
  }, []);

  return {
    forms,
    loading,
    error,
    groupedForms,
    handlePdfClick,
    refetch: fetchForms,
  };
};