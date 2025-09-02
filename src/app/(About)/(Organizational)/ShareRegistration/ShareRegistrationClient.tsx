"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./ShareRegistration.module.css";

const ShareRegistrationClient = memo(function ShareRegistrationClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายทะเบียนหุ้นและติดตามหนี้สิน", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายลงทะเบียนหุ้น..."
      emptyText="ไม่พบข้อมูลฝ่ายลงทะเบียนหุ้น"
      emptyDescription="ไม่มีข้อมูลฝ่ายลงทะเบียนหุ้นที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายลงทะเบียนหุ้น"
      defaultTitle="ฝ่ายลงทะเบียนหุ้น"
    />
  );
});

export default ShareRegistrationClient;