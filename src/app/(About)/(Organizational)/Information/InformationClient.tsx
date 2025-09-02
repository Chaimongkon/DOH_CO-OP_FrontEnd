"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Information.module.css";

const InformationClient = memo(function InformationClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("ฝ่ายสารสนเทศ", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลฝ่ายเทคโนโลยีสารสนเทศ..."
      emptyText="ไม่พบข้อมูลฝ่ายเทคโนโลยีสารสนเทศ"
      emptyDescription="ไม่มีข้อมูลฝ่ายเทคโนโลยีสารสนเทศที่จะแสดง"
      sectionLabel="ข้อมูลฝ่ายเทคโนโลยีสารสนเทศ"
      defaultTitle="ฝ่ายเทคโนโลยีสารสนเทศ"
    />
  );
});

export default InformationClient;