"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Auditor.module.css";

const AuditorClient = memo(function AuditorClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ..."
      emptyText="ไม่พบข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ"
      emptyDescription="ไม่มีข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการที่จะแสดง"
      sectionLabel="ข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ"
      defaultTitle="ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ"
    />
  );
});

export default AuditorClient;