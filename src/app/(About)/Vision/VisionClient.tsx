"use client";
import { memo } from "react";
import { useSociety } from "@/hooks/useSociety";
import { SocietyPage } from "@/components/SocietyPage";
import { Society } from "@/types/about";
import styles from "./Vision.module.css";

interface VisionClientProps {
  initialData: Society[];
}

const VisionClient = memo(function VisionClient({ initialData }: VisionClientProps) {
  const { 
    society, 
    loading, 
    error, 
    fetchImages 
  } = useSociety("ค่านิยม วิสัยทัศน์ พันธกิจ", initialData);

  return (
    <SocietyPage
      society={society}
      loading={loading}
      error={error}
      onRetry={fetchImages}
      styles={styles}
      loadingText="กำลังโหลดข้อมูลวิสัยทัศน์..."
      emptyText="ไม่พบข้อมูลวิสัยทัศน์"
      emptyDescription="ไม่มีข้อมูลค่านิยม วิสัยทัศน์ พันธกิจที่จะแสดง"
      mainLabel="ข้อมูลค่านิยม วิสัยทัศน์ และพันธกิจของสหกรณ์"
      sectionLabel="ค่านิยม วิสัยทัศน์ และพันธกิจ"
      descriptionIdPrefix="vision"
      descriptionText="หน้านี้แสดงข้อมูลค่านิยม วิสัยทัศน์ และพันธกิจของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      titleSuffix="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      imageAltTemplate="รูปภาพแสดง{societyType}ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ประกอบด้วยข้อความและสัญลักษณ์ที่อธิบายถึง{societyType}"
      imageAriaLabelTemplate="รูปภาพแสดง{societyType}ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด"
      imageDescriptionTemplate="รูปภาพนี้แสดงเนื้อหาของ{societyType}ในรูปแบบภาพที่สามารถอ่านและเข้าใจได้"
      imageWidthPercent="60%"
    />
  );
});

export default VisionClient;