"use client";
import React, { useCallback, useEffect, useState, useRef, memo } from "react";
import { News } from "@/types";
import { RightOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import styles from "./HomeNews.module.css";
import Lottie from 'lottie-react';
import animationData from "../../loading2.json";
import Image from "next/image";
import logger from "@/lib/logger";
import { useApiConfig } from "@/hooks/useApiConfig";
import useButtonLoading from "@/hooks/useButtonLoading";
import useNavigation from "@/hooks/useNavigation";
import useDateFormatter from "@/hooks/useDateFormatter";
import useImagePath from "@/hooks/useImagePath";

// Simple in-memory cache for news data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let newsCache: {
  data: News[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

interface NewsApiResponse {
  Id: number;
  Title: string;
  Details: string;
  ImagePath: string | null;
  PdfPath: string | null;
  CreateDate: string;
}

const NewsPage = memo(() => {
  const [news, setNews] = useState<News[]>([]);
  const [cacheUsed, setCacheUsed] = useState(false);
  const lastRequestTime = useRef(0);
  const [loading, setLoading] = useState(true);
  const { isLoading, withLoading } = useButtonLoading();
  const { navigateWithMenu } = useNavigation();
  const { API, URLFile } = useApiConfig();

  // Use date formatter hook
  const { formatDate } = useDateFormatter({
    defaultFormat: 'thai-short',
    useBuddhistEra: true
  });
  
  // Use image path hook
  const { processImage } = useImagePath({
    baseUrl: URLFile || '',
    validateExtension: true,
    sanitizeUrl: true,
    enableLogging: true
  });
  
  // Create a version that doesn't validate extensions for PDFs
  const processFile = useCallback((filePath: string | null) => {
    return processImage(filePath, { validateExtension: false });
  }, [processImage]);

  // Lottie options
  // Lottie props will be passed directly to component

  // Use useRef to store stable references
  const APIRef = useRef(API);
  const processImageRef = useRef(processImage);
  const processFileRef = useRef(processFile);
  
  // Update refs when values change
  APIRef.current = API;
  processImageRef.current = processImage;
  processFileRef.current = processFile;

  const fetchNews = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (newsCache.data && (now - newsCache.timestamp) < CACHE_DURATION) {
        logger.info('Using cached news data');
        setNews(newsCache.data);
        setCacheUsed(true);
        return;
      }

      // Implement request throttling (minimum 3 seconds for 429 prevention)
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 3000) {
        const delay = 3000 - timeSinceLastRequest;
        logger.info(`Throttling news request, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      lastRequestTime.current = Date.now();
      setCacheUsed(false);
      
      const response = await fetch(`${APIRef.current}/News`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("กำลังโหลดข้อมูลข่าวหนักเกินไป กรุณารอสักครู่และลองใหม่อีกครั้ง");
        }
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const response_data = await response.json();
      
      // ข้อมูลอยู่ใน response_data.data.data (pagination response)
      const paginationData = response_data.data || {};
      const newsItems = paginationData.data || [];
      
      const processedData = newsItems.map((newsItem: NewsApiResponse) => {
        const imageResult = processImageRef.current(newsItem.ImagePath);
        const pdfResult = processFileRef.current(newsItem.PdfPath);
        
        const processedItem = {
          id: newsItem.Id,
          title: newsItem.Title,
          details: newsItem.Details,
          createDate: newsItem.CreateDate,
          imagePath: imageResult.url || '',
          pdfPath: pdfResult.url || '',
        };
        
        return processedItem;
      });
      
      // Cache the result
      newsCache = {
        data: processedData,
        timestamp: Date.now()
      };
      
      setNews(processedData);
    } catch (error) {
      logger.error("Failed to fetch news:", error);
      
      // If we have cached data and it's a network error, use the cache
      if (newsCache.data && newsCache.data.length > 0) {
        logger.info('Network error detected, falling back to cached news data');
        setNews(newsCache.data);
        setCacheUsed(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handlePdfClick = useCallback(async (newsItem: News, index: number) => {
    await withLoading(index, async () => {
      if (newsItem.pdfPath && newsItem.pdfPath.trim() !== '') {
        try {
          window.open(newsItem.pdfPath, "_blank");
        } catch {
          message.error("Failed to open PDF");
        }
      } else {
        message.error("PDF not available");
      }
    })();
  }, [withLoading]);

  const handleViewAllClick = useCallback(() => {
    navigateWithMenu("/NewsAll", "ข่าวประชาสัมพันธ์");
  }, [navigateWithMenu]);
  return (
    <section className="py-5">
      <div className="container py-4">
        {loading ? (
          <div className="loading-container">
            <Lottie animationData={animationData} loop={true} autoplay={true} style={{ height: 150, width: 150 }} />
            <p className="text-center mt-2">
              {cacheUsed ? 'กำลังโหลดข้อมูลจากแคช...' : 'กำลังโหลดข่าวสาร...'}
            </p>
          </div>
        ) : (
          <>
            <header className="mb-5">
              <h2
                className="lined lined-center text-uppercase mb-4"
                style={{ marginTop: "100px" }}
              >
                ข่าวประชาสัมพันธ์
              </h2>
              <div style={{ textAlign: "right", width: "100%" }}>
                <Button
                  type="link"
                  icon={<RightOutlined />}
                  className={styles.customButton}
                  onClick={handleViewAllClick}
                >
                  ดูทั้งหมด
                </Button>
              </div>
            </header>

            <div className="row gy-5">
              {news.map((newsItem, index) => (
                <div className="col-lg-22 col-md-6 col-122" key={newsItem.id}>
                  <div className={`product h-100 ${styles.newsCard}`}>
                    <div className="box-image">
                      <div className={`mb-4 primary-overlay ${styles.newsOverlay}`}>
                        <button
                          className={`btn btn-outline-light ${styles.newsButton}`}
                          onClick={() => handlePdfClick(newsItem, index)}
                          disabled={isLoading(index)}
                        >
                          {newsItem.imagePath && (
                            <Image
                              className={`img-fluid ${styles.newsImage}`}
                              src={newsItem.imagePath}
                              alt={`ข่าว: ${newsItem.title}`}
                              width={400}
                              height={600}
                              style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover'
                              }}
                              priority={index < 3}
                              quality={85}
                            />
                          )}
                          <div className="overlay-content d-flex flex-column justify-content-center p-4">
                            <ul className="list-inline mb-0 box-image-content text-center">
                              <li className="list-inline-item"></li>
                            </ul>
                          </div>
                        </button>
                      </div>
                      <div
                        className="text-center"
                        style={{
                          paddingBottom: "10px",
                        }}
                      >
                        <h3
                          className="h4 text-uppercase text-primary"
                          style={{ fontSize: "0.92rem" }}
                        >
                          <span className="text-reset">{newsItem.title}</span>
                        </h3>
                        <p
                          className="bigsmall text-black text-muted-new"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {newsItem.details ? newsItem.details : <br />}
                        </p>
                        <p className="small text-uppercase text-muted-new">
                          {newsItem.createDate
                            ? `โพสต์เมื่อวันที่ ${formatDate(newsItem.createDate)}`
                            : "No date available"}
                        </p>
                        <button
                          className={`btn btn-outline-primary ${styles.readMoreButton}`}
                          onClick={() => handlePdfClick(newsItem, index)}
                          disabled={isLoading(index)}
                        >
                          {isLoading(index)
                            ? "กำลังโหลด..."
                            : "คลิกเพื่อ อ่านต่อ"}
                        </button>
                      </div>
                    </div>
                    {index < 3 && (
                      <ul className="list-unstyled p-0 ribbon-holder mb-0">
                        <li className="mb-1">
                          <div className="ribbon sale ribbon-primary flash">
                            NEW
                          </div>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
});

NewsPage.displayName = 'NewsPage';

export default NewsPage;
