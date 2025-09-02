"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ReportBusiness } from "@/types";
import { message } from "antd";
import Image from "next/image";
import Lottie from 'lottie-react';
import animationData from "../../loading2.json";
import logger from "@/lib/logger";
import useButtonLoading from "@/hooks/useButtonLoading";
import { useApiConfig } from "@/hooks/useApiConfig";
import "./BookCover.css";

const BusinessReport = () => {
  const [business, setBusiness] = useState<ReportBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoading, withLoading } = useButtonLoading();
  const { API, URLFile } = useApiConfig();

  // Lottie options
  // Lottie props will be passed directly to component

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch(`${API}/BusinessReport`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      
      // Define API response interface
      interface BusinessReportApiResponse {
        Id: number;
        Title: string;
        ImagePath: string | null;
        FilePath: string | null;
        CreateDate: string;
      }
      
      const processedData = data.map((newsItem: BusinessReportApiResponse) => ({
        id: newsItem.Id,
        title: newsItem.Title,
        Title: newsItem.Title, // Keep both for compatibility
        imagePath: newsItem.ImagePath ? `${URLFile}${newsItem.ImagePath}` : "",
        image: newsItem.ImagePath ? `${URLFile}${newsItem.ImagePath}` : "",
        filePath: newsItem.FilePath ? `${URLFile}${newsItem.FilePath}` : "",
        filepath: newsItem.FilePath ? `${URLFile}${newsItem.FilePath}` : "", // lowercase version
        pdffile: newsItem.FilePath ? `${URLFile}${newsItem.FilePath}` : "",
        File: newsItem.FilePath ? `${URLFile}${newsItem.FilePath}` : "",
        createDate: newsItem.CreateDate,
      }));
      setBusiness(processedData);
    } catch (error) {
      logger.error("Failed to fetch business reports:", error);
    } finally {
      setLoading(false);
    }
  }, [API, URLFile]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handlePdfClick = async (newsItem: ReportBusiness, index: number) => {
    await withLoading(index, async () => {
      const pdfPath = newsItem.filepath || newsItem.pdffile || newsItem.File;
      if (pdfPath) {
        try {
          window.open(pdfPath, "_blank");
        } catch (error) {
          logger.error("Failed to open PDF:", error);
          message.error("Failed to open PDF");
        }
      } else {
        message.error("PDF not available");
      }
    })();
  };

  return (
    <>
      <section className="py-5">
        <div className="container py-4">
          {loading ? (
            <div className="loading-container">
              <Lottie animationData={animationData} loop={true} autoplay={true} style={{ height: 150, width: 150 }} />
            </div>
          ) : (
            <>
              <div className="row gy-5">
                {business.map((newsItem, index) => (
                  <div
                    className="col-lg-4 d-flex justify-content-center"
                    key={index}
                  >
                    {/* Book item */}
                    <div className="box-image-text text-center primary-overlay">
                      {/* Book spine elements */}
                      <div className="book-bands"></div>
                      <div className="book-pages"></div>
                      
                      <Image
                        className="img-fluid"
                        src={newsItem.imagePath}
                        alt={`Business report cover: ${newsItem.title}`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                      />
                      <div className="book-shine"></div>
                      <div className="overlay-content d-flex flex-column justify-content-center p-4">
                        <h3 className="text-uppercase box-image-text-heading">
                          {newsItem.title}
                        </h3>
                        <ul className="list-inline mb-0 box-image-text-content">
                          <li className="list-inline-item">
                            <button
                              className="btn btn-sm"
                              onClick={() => handlePdfClick(newsItem, index)}
                              disabled={isLoading(index)}
                            >
                              <i className="fas fa-download me-2"></i>
                              {isLoading(index) ? "กำลังโหลด..." : "เปิดเอกสาร"}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

    </>
  );
};

export default BusinessReport;
