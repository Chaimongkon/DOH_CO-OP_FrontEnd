"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Pagination from "@mui/material/Pagination";
import { useMediaQuery } from "@mui/material";
import { message } from "antd";
import debounce from "lodash.debounce";
import { LottieSectionLoading } from "@/components/LottieLoading";
import Image from "next/image";
import logger from "@/lib/logger";
import { NewsItem } from "@/types";
import styles from "../News/HomeNews.module.css";
import newsAllStyles from "./NewsAll.module.css";
import { useApiConfig } from "@/hooks/useApiConfig";
import useButtonLoading from "@/hooks/useButtonLoading";
function NewsAll() {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10); // Rows per page, keep it constant
  const [totalRows, setTotalRows] = useState(0); // Total number of items
  const [search, setSearch] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoading, withLoading } = useButtonLoading();

  const { API } = useApiConfig();

  // Responsive check for mobile devices
  const isMobile = useMediaQuery("(max-width:991px)");


  // Optimized fetch function using memoization  
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API}/News?page=${page}&per_page=${rowsPerPage}&search=${search}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      
      // Handle pagination response from News API
      const responseData = data.data || {};
      const newsItems = responseData.data || [];
      const processedData = newsItems.map((newsItem: NewsItem) => {
        // Fix image path to use correct API route
        const imagePath = newsItem.ImagePath 
          ? `${API}/News/File/Image/${newsItem.ImagePath.split('/').pop()}` 
          : undefined;
        const pdfPath = newsItem.PdfPath 
          ? `${API}/News/File/Pdf/${newsItem.PdfPath.split('/').pop()}` 
          : undefined;
        
        return {
          Id: newsItem.Id,
          Title: newsItem.Title,
          Details: newsItem.Details,
          CreateDate: newsItem.CreateDate,
          ImagePath: imagePath,
          PdfPath: pdfPath,
        };
      });
      setNews(processedData);
      setTotalRows(responseData.total || 0);
    } catch (error) {
      logger.error("Failed to fetch news:", error);
      message.error("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, [API, page, rowsPerPage, search]);

  // Handle search with debounce to prevent unnecessary fetches
  const debouncedSearchChange = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1); // Reset to first page when search changes
      }, 300),
    []
  );

  // Fetch news data when page, rowsPerPage, or search changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearchChange.cancel();
    };
  }, [debouncedSearchChange]);

  // Handle PDF click event
  const handlePdfClick = async (newsItem: NewsItem, index: number) => {
    await withLoading(index, async () => {
      if (newsItem.PdfPath) {
        try {
          window.open(newsItem.PdfPath, "_blank");
        } catch {
          message.error("Failed to open PDF");
        }
      } else {
        message.error("PDF not available");
      }
    })();
  };

  // Handle pagination change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value); // Update page and refetch
  };

  return (
    <section className="py-5">
      <div className="container py-4">
        {loading ? (
          <LottieSectionLoading tip="กำลังโหลดข่าวประชาสัมพันธ์..." />
        ) : (
          <>
            <header className="mb-5">
              <h2 className="lined lined-center text-uppercase">
                ข่าวประชาสัมพันธ์
              </h2>
            </header>
            <div className="row gy-5">
              {isMobile && (
                <div className="col-lg-3 mb-4">
                  <h3 className="h4 lined text-uppercase mb-4">ค้นหา</h3>
                  <div className={`input-group mb-3 ${newsAllStyles.searchGroup}`}>
                    <input
                      className={`form-control ${newsAllStyles.searchInput}`}
                      type="text"
                      placeholder="ค้นหา ข่าวประชาสัมพันธ์"
                      aria-label="search"
                      onChange={(e) => debouncedSearchChange(e.target.value)}
                    />
                    <button
                      className={`btn btn-primary ${newsAllStyles.searchButton}`}
                      type="button"
                      onClick={() => setPage(1)}
                    >
                      <i className="fas fa-search" />
                    </button>
                  </div>
                </div>
              )}

              <div className={`col-lg-9 ${!isMobile ? "order-lg-1" : ""}`}>
                <div className="row gy-4 mb-5">
                  {news.map((release, index) => (
                    <div
                      className={`${isMobile ? "col-6" : "col-12"} mb-4`}
                      key={release.Id}
                    >
                      <div className={`row ${!isMobile ? "" : "text-center"}`}>
                        <div className={`${isMobile ? "col-12" : "col-lg-4"}`}>
                          <a
                            className="d-block"
                            href={release.PdfPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handlePdfClick(release, index)}
                          >
                            {release.ImagePath && (
                              <Image
                                className={`img-fluid ${styles.newsImage}`}
                                src={release.ImagePath}
                                alt={`ข่าว: ${release.Title}`}
                                width={400}
                                height={300}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  objectFit: 'cover'
                                }}
                                priority={index < 3}
                                quality={85}
                              />
                            )}
                          </a>
                        </div>
                        <div
                          className={`${isMobile ? "col-12" : "col-lg-8"}`}
                          style={{ paddingTop: !isMobile ? "30px" : "20px" }}
                        >
                          <h2
                            className="text-uppercase mb-2"
                            style={{
                              fontSize: !isMobile ? "1.5em" : "inherit", // Larger font on desktop
                            }}
                          >
                            <a
                              className="text-dark"
                              href={release.PdfPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handlePdfClick(release, index)}
                            >
                              {release.Title}
                            </a>
                          </h2>
                          <p
                            className="text-sm text-gray-700 mb-3"
                            style={{
                              fontSize: !isMobile ? "1.1em" : "inherit", // Larger font on desktop
                            }}
                          >
                            {release.Details}
                          </p>
                          <p
                            className={`${
                              !isMobile ? "text-end" : "text-center"
                            }`}
                          >
                            <button
                              className={`btn btn-outline-primary ${styles.readMoreButton}`}
                              style={{
                                padding: !isMobile ? "12px 24px" : "10px 20px",
                                fontSize: !isMobile ? "0.9em" : "0.8em",
                              }}
                              onClick={() => handlePdfClick(release, index)}
                              disabled={isLoading(index)}
                            >
                              {isLoading(index)
                                ? "กำลังโหลด..."
                                : "คลิกเพื่อ อ่านต่อ"}
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isMobile && (
                <div className="col-lg-3 order-lg-2">
                  <div className="mb-4">
                    <h3 className="h4 lined text-uppercase mb-4">ค้นหา</h3>
                    <div className={`input-group mb-3 ${newsAllStyles.searchGroup}`}>
                      <input
                        className={`form-control ${newsAllStyles.searchInput}`}
                        type="text"
                        placeholder="ค้นหา ข่าวประชาสัมพันธ์"
                        aria-label="search"
                        onChange={(e) => debouncedSearchChange(e.target.value)}
                      />
                      <button
                        className={`btn btn-primary ${newsAllStyles.searchButton}`}
                        type="button"
                        onClick={() => setPage(1)}
                      >
                        <i className="fas fa-search" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="py-4 border-top">
              <div className="d-flex justify-content-center">
                <Pagination
                  count={Math.ceil(totalRows / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="secondary"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default NewsAll;
