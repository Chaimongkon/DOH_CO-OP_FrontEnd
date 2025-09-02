"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./BoardEthics.module.css";
import { Society } from "@/types/about";
import DataStates from "@/components/DataStates";
import { getApiConfig } from "@/lib/config";
import { ApiSociety } from "@/types";
import logger from "@/lib/logger";

interface BoardEthicsClientProps {
  initialData: Society[];
}

export default function BoardEthicsClient({ initialData }: BoardEthicsClientProps) {
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
            society.societyType === "จรรยาบรรณสำหรับคณะกรมมการดำเนินการ" && 
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
      loadingText="กำลังโหลดข้อมูลจรรยาบรรณ..."
      emptyText="ไม่พบข้อมูลจรรยาบรรณ"
      emptyDescription="ไม่มีข้อมูลจรรยาบรรณสำหรับคณะกรรมการดำเนินการที่จะแสดง"
    >
      <main role="main" aria-label="จรรยาบรรณสำหรับคณะกรรมการดำเนินการสหกรณ์">
        <section 
          className={styles.section} 
          aria-label="จรรยาบรรณคณะกรรมการดำเนินการ"
          aria-describedby="board-ethics-description"
        >
          <div id="board-ethics-description" className="sr-only">
            หน้านี้แสดงข้อมูลจรรยาบรรณสำหรับคณะกรรมการดำเนินการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
          </div>
          {society.map((s, index) => (
            <article 
              className={styles.container} 
              key={s.id}
              aria-labelledby={`board-ethics-title-${s.id}`}
            >
              <header className={styles.header}>
                <h1 
                  id={`board-ethics-title-${s.id}`}
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
                  alt={`เอกสารจรรยาบรรณสำหรับคณะกรรมการดำเนินการ ประกอบด้วยหลักเกณฑ์ ข้อปฏิบัติ และแนวทางการปฏิบัติงานที่ดีสำหรับคณะกรรมการ สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด`}
                  width={800}
                  height={600}
                  className={styles.image}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  style={{
                    width: '80%',
                    height: 'auto',
                  }}
                  aria-describedby={`board-ethics-image-desc-${s.id}`}
                />
                <div id={`board-ethics-image-desc-${s.id}`} className="sr-only">
                  เอกสารนี้แสดงรายละเอียดจรรยาบรรณสำหรับคณะกรรมการดำเนินการ รวมถึงหลักเกณฑ์และแนวปฏิบัติที่ดี
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </DataStates>
  );
}