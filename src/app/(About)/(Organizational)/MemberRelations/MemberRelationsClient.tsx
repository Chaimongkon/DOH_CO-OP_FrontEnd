"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./MemberRelations.module.css";

const MemberRelationsClient = memo(function MemberRelationsClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายสมาชิกสัมพันธ์และสวัสดิการ", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายสัมพันธ์สมาชิก..."
      emptyText="ไม่พบข้อมูลฝ่ายสัมพันธ์สมาชิก"
      emptyDescription="ไม่มีข้อมูลฝ่ายสัมพันธ์สมาชิกที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายสัมพันธ์สมาชิก"
      defaultTitle="ฝ่ายสัมพันธ์สมาชิก"
    />
  );
});

export default MemberRelationsClient;