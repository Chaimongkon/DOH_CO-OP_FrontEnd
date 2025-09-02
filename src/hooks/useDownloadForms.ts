import { useState, useCallback, useEffect } from "react";
import { DownloadForm, FormDownloadResponse } from "@/types";
import { message } from "antd";
import { useApiConfig } from "@/hooks/useApiConfig";
import { apiRequest } from "@/utils/api";
import logger from "@/lib/logger";

/**
 * Valid member types for download forms
 */
const VALID_DOWNLOAD_FORM_MEMBERS = [
  "สมาชิกสามัญประเภท ก",
  "สมาชิกสามัญประเภท ข", 
  "สมาชิกสมทบ",
  "สมาชิกประเภท ก ข สมทบ",
] as const;

type ValidMemberType = typeof VALID_DOWNLOAD_FORM_MEMBERS[number];

/**
 * Groups forms by member type for download forms
 */
const groupDownloadFormsByMember = (forms: DownloadForm[]) => {
  const grouped = forms.reduce((groups, form) => {
    const { typeMember } = form;
    if (VALID_DOWNLOAD_FORM_MEMBERS.includes(typeMember as ValidMemberType)) {
      if (!groups[typeMember]) {
        groups[typeMember] = [];
      }
      groups[typeMember].push(form);
    }
    return groups;
  }, {} as { [key: string]: DownloadForm[] });

  return Object.keys(grouped)
    .sort((a, b) => VALID_DOWNLOAD_FORM_MEMBERS.indexOf(a as ValidMemberType) - VALID_DOWNLOAD_FORM_MEMBERS.indexOf(b as ValidMemberType))
    .reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {} as { [key: string]: DownloadForm[] });
};

/**
 * Custom hook for fetching and managing download forms
 * @param typeForm - The type of form to filter by
 * @param formLabel - Label for loading/error messages
 * @returns Object with forms data, loading state, error state, and grouped forms
 */
export const useDownloadForms = (typeForm: string, formLabel: string) => {
  const [forms, setForms] = useState<DownloadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getApiUrl, getImageUrl } = useApiConfig();

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: FormDownloadResponse[] = await apiRequest(getApiUrl('DownloadForm'));
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid API response format");
      }

      const processedData: DownloadForm[] = data
        .filter((form: FormDownloadResponse) => form.TypeForm === typeForm)
        .map((form: FormDownloadResponse) => {
          return {
            id: form.Id,
            title: form.Title,
            typeForm: form.TypeForm,
            typeMember: form.TypeMember,
            filePath: getImageUrl(form.FilePath),
            pdffile: getImageUrl(form.FilePath),
            File: form.FilePath || "",
            createDate: form.CreateDate || new Date().toISOString(),
          };
        });

      setForms(processedData);
      setError(null);
      
      logger.info("Forms loaded successfully", {
        totalForms: data.length,
        filteredForms: processedData.length,
        typeForm
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const userErrorMessage = `ไม่สามารถดึงข้อมูลแบบฟอร์ม: ${errorMessage}`;
      
      logger.error("Failed to fetch forms:", error);
      setError(userErrorMessage);
      message.error(userErrorMessage);
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, getImageUrl, typeForm]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const groupedForms = groupDownloadFormsByMember(forms);

  const handlePdfClick = useCallback((formItem: DownloadForm) => {
    if (!formItem.pdffile || formItem.pdffile.trim() === "") {
      message.error(`ไม่มีไฟล์สำหรับ: ${formItem.title}`);
      logger.warn("PDF file not available", { 
        formId: formItem.id, 
        title: formItem.title 
      });
      return;
    }

    window.open(formItem.pdffile, "_blank", "noopener,noreferrer");
    
    logger.info("PDF opened successfully", { 
      formId: formItem.id, 
      title: formItem.title,
      filePath: formItem.pdffile
    });
  }, []);

  return {
    forms,
    loading,
    error,
    groupedForms,
    handlePdfClick,
    refetch: fetchForms,
    formLabel,
  };
};