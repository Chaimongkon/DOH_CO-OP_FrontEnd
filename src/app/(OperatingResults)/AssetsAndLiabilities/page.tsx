"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import Image from "next/image";
import Lottie from 'lottie-react';
import animationData from "../../loading2.json";
import logger from "@/lib/logger";
import styles from './AssetsAndLiabilities.module.css';
interface Asset {
  Id: number;
  PdfFile: string;
  TitleMonth: string;
  Year: string; // Assuming Year is part of the asset data
}

interface YearData {
  Year: string;
}

const AssetsAndLiabilities = () => {
  const [year, setYear] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [allyear, setAllYear] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL as string;

  const fetchAllYears = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/AssetsLiabilities`);
      const data = await res.json();
      setAllYear(data.data);
      if (data.data.length > 0) {
        setYear(data.data[0].Year);
      }
    } catch (error) {
      logger.error("Failed to fetch years:", error);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchAssetsForYear = useCallback(
    async (selectedYear: string) => {
      try {
        const res = await fetch(`${API}/AssetsLiabilities?year=${selectedYear}`);
        const data = await res.json();
        setAssets(data.data);
      } catch (error) {
        logger.error("Failed to fetch assets:", error);
      }
    },
    [API]
  );

  useEffect(() => {
    fetchAllYears();
  }, [fetchAllYears]);

  useEffect(() => {
    if (year) {
      fetchAssetsForYear(year);
    }
  }, [year, fetchAssetsForYear]);

  const handleYearClick = (selectedYear: string) => {
    setYear(selectedYear);
  };

  const uniqueYears = useMemo(
    () => Array.from(new Set(allyear.map((row) => row.Year))),
    [allyear]
  );

  const filteredAssets = useMemo(
    () => assets.filter((asset) => asset.Year === year),
    [assets, year]
  );


  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <Lottie animationData={animationData} loop={true} autoplay={true} />
        </div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <section className="py-5">
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.mainTitle}>รายงานทางการเงิน</h1>
          <p className={styles.subtitle}>ข้อมูลสินทรัพย์และหนี้สิน สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด</p>
        </div>

        {/* Year Selector */}
        <div className={styles.yearSection}>
          <h2 className={styles.yearTitle}>เลือกปี</h2>
          <div className={styles.yearButtons}>
            {uniqueYears.map((yearItem) => (
              <button
                key={yearItem}
                className={`${styles.yearButton} ${year === yearItem ? styles.yearButtonActive : ''}`}
                onClick={() => handleYearClick(yearItem)}
              >
                <i className="fas fa-calendar-alt me-2"></i>
                ประจำปี {yearItem}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Section */}
        {year && (
          <div className={styles.assetsSection}>
            <h2 className={styles.sectionTitle}>รายงานประจำปี {year}</h2>
            
            {filteredAssets.length > 0 ? (
              <div className={styles.assetsGrid}>
                {filteredAssets.map((asset) => (
                  <div key={asset.Id} className={styles.assetCard}>
                    <div className={styles.assetIconContainer}>
                      <div className={styles.assetIcon}>
                        <Image
                          src="/image/logo/pdf.png"
                          alt={`PDF document for ${asset.TitleMonth}`}
                          width={80}
                          height={80}
                          unoptimized
                        />
                      </div>
                    </div>
                    
                    <h3 className={styles.assetTitle}>{asset.TitleMonth}</h3>
                    <div className={styles.assetMeta}>ปี {asset.Year}</div>
                    
                    <a
                      href={base64ToBlobUrl(asset.PdfFile, 'application/pdf')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadButton}
                    >
                      <i className="fas fa-download"></i>
                      เปิดเอกสาร
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h3 className={styles.emptyTitle}>ไม่พบข้อมูล</h3>
                <p className={styles.emptyMessage}>ยังไม่มีรายงานสำหรับปี {year}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AssetsAndLiabilities;
