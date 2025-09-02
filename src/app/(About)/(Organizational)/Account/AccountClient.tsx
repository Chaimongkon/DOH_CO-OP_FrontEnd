"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Account.module.css";

const AccountClient = memo(function AccountClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายบัญชี", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายบัญชี..."
      emptyText="ไม่พบข้อมูลฝ่ายบัญชี"
      emptyDescription="ไม่มีข้อมูลฝ่ายบัญชีที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายบัญชี"
      defaultTitle="ฝ่ายบัญชี"
    />
  );
});

export default AccountClient;