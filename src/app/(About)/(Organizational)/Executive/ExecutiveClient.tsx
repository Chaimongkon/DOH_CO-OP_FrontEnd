"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Executive.module.css";

const ExecutiveClient = memo(function ExecutiveClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ผู้จัดการใหญ่และรองผู้จัดการฯ", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลผู้บริหาร..."
      emptyText="ไม่พบข้อมูลผู้บริหาร"
      emptyDescription="ไม่มีข้อมูลผู้จัดการใหญ่และรองผู้จัดการฯ ที่จะแสดง"
      sectionLabel="ข้อมูลผู้จัดการใหญ่และรองผู้จัดการ"
      defaultTitle="ผู้จัดการใหญ่และรองผู้จัดการฯ"
    />
  );
});

export default ExecutiveClient;