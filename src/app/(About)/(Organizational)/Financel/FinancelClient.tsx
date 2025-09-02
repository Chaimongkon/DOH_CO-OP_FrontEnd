"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Financel.module.css";

const FinancelClient = memo(function FinancelClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายการเงินและการลงทุน", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายการเงินและการลงทุน..."
      emptyText="ไม่พบข้อมูลฝ่ายการเงินและการลงทุน"
      emptyDescription="ไม่มีข้อมูลฝ่ายการเงินและการลงทุนที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายการเงินและการลงทุน"
      defaultTitle="ฝ่ายการเงินและการลงทุน"
    />
  );
});

export default FinancelClient;