"use client";
import { memo } from "react";
import { useSociety } from "@/hooks/useSociety";
import { SocietyPage } from "@/components/SocietyPage";
import { Society } from "@/types/about";
import styles from "./Policy.module.css";

interface PolicyClientProps {
  initialData: Society[];
}

const PolicyClient = memo(function PolicyClient({ initialData }: PolicyClientProps) {
  const { 
    society, 
    loading, 
    error, 
    fetchImages 
  } = useSociety("นโยบายสหกรณ์", initialData);

  return (
    <SocietyPage
      society={society}
      loading={loading}
      error={error}
      onRetry={fetchImages}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลนโยบายสหกรณ์..."
      emptyText="ไม่พบข้อมูลนโยบายสหกรณ์"
      emptyDescription="ไม่มีข้อมูลนโยบายสหกรณ์ที่จะแสดง"
      mainLabel="นโยบายสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      sectionLabel="นโยบายสหกรณ์"
      descriptionIdPrefix="policy"
      descriptionText="หน้านี้แสดงข้อมูลนโยบายของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ประกอบด้วยทิศทาง แนวปฏิบัติ และหลักเกณฑ์การดำเนินงาน"
      titleSuffix="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      imageAltTemplate="เอกสาร{societyType} ประกอบด้วยทิศทาง แนวปฏิบัติ และหลักเกณฑ์การดำเนินงานของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      imageAriaLabelTemplate="เอกสารแสดง{societyType}ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      imageDescriptionTemplate="เอกสารนี้แสดงรายละเอียด{societyType} รวมถึงทิศทางและแนวปฏิบัติในการดำเนินงานของสหกรณ์"
      imageWidthPercent="80%"
    />
  );
});

export default PolicyClient;