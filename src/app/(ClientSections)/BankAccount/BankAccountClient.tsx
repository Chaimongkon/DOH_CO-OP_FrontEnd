"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getApiConfig } from "@/lib/config";
import useAsyncOperation from "@/hooks/useAsyncOperation";
import logger from "@/lib/logger";
import LoadingState from "@/components/ClientSections/LoadingState";
import ErrorState from "@/components/ClientSections/ErrorState";
import {
  BankAccountService,
  BankAccountApiService,
  BankAccountClientProps,
  BANK_ACCOUNT_CONFIG,
  BANK_ACCOUNT_ERROR_MESSAGES,
  BANK_ACCOUNT_UI_TEXT,
  BANK_ACCOUNT_ENDPOINTS,
  mapApiServiceToService,
} from "@/types/bank-account";
import styles from "./BankAccount.module.css";

export default function BankAccountClient({ initialData }: BankAccountClientProps) {
  const [service, setService] = useState<BankAccountService[]>(initialData);

  const fetchServices = async (): Promise<BankAccountService[]> => {
    const { apiUrl, fileUrl } = getApiConfig();

    const response = await fetch(`${apiUrl}${BANK_ACCOUNT_ENDPOINTS.SERVICES}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const apiResponse = await response.json();
    
    // Handle both old format (direct array) and new BaseApiResponse format
    const rawData: BankAccountApiService[] = Array.isArray(apiResponse) 
      ? apiResponse 
      : apiResponse.data || [];

    return rawData
      .map((service: BankAccountApiService) => 
        mapApiServiceToService(service, fileUrl)
      )
      .filter(
        (service: BankAccountService) => 
          service.subcategories === BANK_ACCOUNT_CONFIG.subcategoryFilter && 
          service.status
      );
  };

  const { data: fetchedServices, loading, error, execute } = useAsyncOperation(
    fetchServices,
    {
      errorMessage: BANK_ACCOUNT_ERROR_MESSAGES.fetchError
    }
  );

  useEffect(() => {
    if (initialData.length === 0) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData.length]);

  useEffect(() => {
    if (fetchedServices) {
      setService(fetchedServices);
    }
  }, [fetchedServices]);

  // Handle loading state
  if (loading) {
    return (
      <LoadingState
        text={BANK_ACCOUNT_UI_TEXT.loadingText}
        variant="shimmer"
        showImage={true}
        rows={3}
        size="default"
      />
    );
  }

  // Handle error state
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={fetchServices}
        title="ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้"
        showRetry={true}
        showRefresh={true}
        size="default"
      />
    );
  }

  // Handle empty state
  if (service.length === 0) {
    return (
      <ErrorState
        error={null}
        onRetry={fetchServices}
        title={BANK_ACCOUNT_UI_TEXT.emptyTitle}
        description={BANK_ACCOUNT_UI_TEXT.emptyDescription}
        variant="notFound"
        showRetry={true}
        showRefresh={false}
        size="default"
      />
    );
  }

  return (
      <section 
        className={styles.section} 
        aria-label={BANK_ACCOUNT_UI_TEXT.pageTitle}
        role="main"
      >
        {service.map((s) => (
          <article className={styles.container} key={s.id}>
            <div className={styles.imageContainer}>
              {s.imagePath ? (
                <Image
                  src={s.imagePath}
                  alt={`ข้อมูล${s.subcategories}ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด`}
                  fill
                  className={styles.serviceImage}
                  priority={true}
                  sizes="(max-width: 480px) 90vw, (max-width: 768px) 80vw, 60vw"
                  quality={85}
                  onError={() => {
                    logger.warn(`Failed to load image for ${s.subcategories}: ${s.imagePath}`);
                  }}
                />
              ) : (
                <div className={styles.noImagePlaceholder}>
                  <i className="fas fa-image" aria-hidden="true"></i>
                  <p>{BANK_ACCOUNT_UI_TEXT.noImageAlt}</p>
                </div>
              )}
            </div>
            
            {s.urlLink && (
              <div className={styles.documentSection}>
                <header>
                  <h2 className={styles.documentTitle}>
                    {BANK_ACCOUNT_UI_TEXT.downloadDocument}
                  </h2>
                </header>
                <ul className={styles.documentList} role="list">
                  <li className={styles.documentItem} role="listitem">
                    <div className={styles.iconContainer} aria-hidden="true">
                      <i className="fas fa-download"></i>
                    </div>
                    <a
                      href={s.urlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.documentLink}
                      aria-label={`ดาวน์โหลดแบบฟอร์ม${s.subcategories} เปิดในหน้าต่างใหม่`}
                    >
                      <p className={styles.documentText}>
                        {BANK_ACCOUNT_UI_TEXT.documentFormPrefix}{s.subcategories}
                      </p>
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </article>
        ))}
      </section>
  );
}