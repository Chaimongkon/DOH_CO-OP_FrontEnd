"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./OfficerEthics.module.css";
import { Society } from "@/types/about";
import DataStates from "@/components/DataStates";
import { getApiConfig } from "@/lib/config";
import { ApiSociety } from "@/types";
import logger from "@/lib/logger";

interface OfficerEthicsClientProps {
  initialData: Society[];
}

export default function OfficerEthicsClient({ initialData }: OfficerEthicsClientProps) {
  const [society, setSociety] = useState<Society[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const { apiUrl, fileUrl } = getApiConfig();
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/SocietyCoop`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data: ApiSociety[] = await response.json();

      const processedData: Society[] = data
        .map((society: ApiSociety) => ({
          id: society.Id,
          imagePath: society.ImagePath ? `${fileUrl}${society.ImagePath}` : "",
          societyType: society.SocietyType,
          status: society.IsActive,
        }))
        .filter(
          (society: Society) =>
            society.societyType === "จรรยาบรรณสำหรับเจ้าหน้าที่" && 
            society.status && 
            society.imagePath
        );

      setSociety(processedData);
    } catch (error) {
      logger.error("Failed to fetch images:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataStates
      loading={loading}
      error={error}
      isEmpty={society.length === 0}
      onRetry={fetchImages}
      loadingText="กำลังโหลดข้อมูลจรรยาบรรณเจ้าหน้าที่..."
      emptyText="ไม่พบข้อมูลจรรยาบรรณเจ้าหน้าที่"
      emptyDescription="ไม่มีข้อมูลจรรยาบรรณสำหรับเจ้าหน้าที่ที่จะแสดง"
    >
      <main role="main" aria-label="จรรยาบรรณสำหรับเจ้าหน้าที่สหกรณ์">
        <section 
          className={styles.section} 
          aria-label="จรรยาบรรณเจ้าหน้าที่"
          aria-describedby="officer-ethics-description"
        >
          <div id="officer-ethics-description" className="sr-only">
            หน้านี้แสดงข้อมูลจรรยาบรรณสำหรับเจ้าหน้าที่ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
          </div>
          {society.map((s, index) => (
            <article 
              className={styles.container} 
              key={s.id}
              aria-labelledby={`officer-ethics-title-${s.id}`}
            >
              <header className={styles.header}>
                <h1 
                  id={`officer-ethics-title-${s.id}`}
                  className={styles.title}
                  role="heading" 
                  aria-level={1}
                  tabIndex={0}
                >
                  {s.societyType} สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
                </h1>
              </header>
              <div 
                className={styles.imageContainer}
                role="img"
                aria-label={`เอกสารแสดง${s.societyType}ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด`}
              >
                <Image
                  src={s.imagePath}
                  alt={`เอกสารจรรยาบรรณสำหรับเจ้าหน้าที่ ประกอบด้วยหลักเกณฑ์ ข้อปฏิบัติ และแนวทางการปฏิบัติงานที่ดีสำหรับเจ้าหน้าที่ สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด`}
                  width={800}
                  height={600}
                  className={styles.image}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  style={{
                    width: '60%',
                    height: 'auto',
                  }}
                  aria-describedby={`officer-ethics-image-desc-${s.id}`}
                />
                <div id={`officer-ethics-image-desc-${s.id}`} className="sr-only">
                  เอกสารนี้แสดงรายละเอียดจรรยาบรรณสำหรับเจ้าหน้าที่ รวมถึงหลักเกณฑ์และแนวปฏิบัติในการทำงาน
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </DataStates>
  );
}