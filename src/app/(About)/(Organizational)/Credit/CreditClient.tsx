"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Credit.module.css";

const CreditClient = memo(function CreditClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายสินเชื่อ", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายสินเชื่อ..."
      emptyText="ไม่พบข้อมูลฝ่ายสินเชื่อ"
      emptyDescription="ไม่มีข้อมูลฝ่ายสินเชื่อที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายสินเชื่อ"
      defaultTitle="ฝ่ายสินเชื่อ"
    />
  );
});

export default CreditClient;