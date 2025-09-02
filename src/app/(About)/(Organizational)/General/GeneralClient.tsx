"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./General.module.css";

const GeneralClient = memo(function GeneralClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายบริหารทั่วไป", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายบริหารทั่วไป..."
      emptyText="ไม่พบข้อมูลฝ่ายบริหารทั่วไป"
      emptyDescription="ไม่มีข้อมูลฝ่ายบริหารทั่วไปที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายบริหารทั่วไป"
      defaultTitle="ฝ่ายบริหารทั่วไป"
    />
  );
});

export default GeneralClient;