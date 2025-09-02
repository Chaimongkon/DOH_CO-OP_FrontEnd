"use client";
import { memo } from "react";
import { useOrganizational } from "@/hooks/useOrganizational";
import { OrganizationalPage } from "@/components/OrganizationalPage";
import { BoardComponentProps } from "@/types/organizational";
import styles from "./Board.module.css";

const BoardClient = memo(function BoardClient({ initialData }: BoardComponentProps) {
  const { 
    organizationals, 
    loading, 
    error, 
    fetchOrganizational 
  } = useOrganizational("คณะกรรมการดำเนินการ ชุดที่ 49", initialData);

  return (
    <OrganizationalPage
      organizationals={organizationals}
      loading={loading}
      error={error}
      onRetry={fetchOrganizational}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลคณะกรรมการ..."
      emptyText="ไม่พบข้อมูลคณะกรรมการ"
      emptyDescription="ไม่มีข้อมูลคณะกรรมการดำเนินการที่จะแสดง"
      sectionLabel="ข้อมูลคณะกรรมการดำเนินการ"
      defaultTitle="คณะกรรมการดำเนินการ ชุดที่ 49"
    />
  );
});

export default BoardClient;