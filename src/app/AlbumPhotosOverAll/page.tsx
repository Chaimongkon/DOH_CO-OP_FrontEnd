"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useMediaQuery } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { message } from "antd";
import { LottieSectionLoading } from "@/components/LottieLoading";
import logger from "@/lib/logger";
import { useApiConfig } from "@/hooks/useApiConfig";

interface Photo {
  Id: string;
  Title: string;
  Cover: string;
}

export default function AlbumPhotosOverAll() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 12; // Show 12 photos per page

  const { API, URLFile } = useApiConfig();
  const isMobile = useMediaQuery("(max-width:991px)");

  const fetchPhotosData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/PhotosCover`);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const responseData = await response.json();

      // Handle both direct array and wrapped response formats
      let data: Photo[] = [];
      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;
      } else if (responseData.success && responseData.data) {
        data = responseData.data;
      }

      // Process photos with correct image paths
      const processedPhotos = data.map((photo) => ({
        ...photo,
        Cover: photo.Cover ? `${URLFile}${photo.Cover}` : "",
      }));

      // Store all photos first
      const allPhotos = processedPhotos.filter((photo) => photo.Cover); // Only photos with valid covers

      // Pagination logic
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedPhotos = allPhotos.slice(startIndex, endIndex);

      setPhotos(paginatedPhotos);
      setTotalRows(allPhotos.length);
    } catch (error) {
      logger.error("Failed to fetch photos data:", error);
      message.error("ไม่สามารถโหลดภาพกิจกรรมได้");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [API, URLFile, page, rowsPerPage]);

  useEffect(() => {
    fetchPhotosData();
  }, [fetchPhotosData]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhotoClick = (photo: Photo) => {
    window.location.href = `/ShowAllPhotos/${photo.Id}`;
  };

  if (loading) {
    return (
      <div className="py-5">
        <div className="container py-4">
          <LottieSectionLoading tip="กำลังโหลดภาพกิจกรรมสหกรณ์..." />
        </div>
      </div>
    );
  }

  return (
    <section className="py-5">
      <div className="container py-4">
        <header className="mb-5">
          <h1 className="lined lined-center text-uppercase mb-4">
            ภาพกิจกรรมสหกรณ์ทั้งหมด
          </h1>
          <p className="text-center text-muted">
            รวมภาพกิจกรรมและเหตุการณ์ต่าง ๆ ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
          </p>
        </header>
        {/* Header will be displayed in SubHeader via page title */}

        {photos.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-images fs-1 text-muted mb-3"></i>
            </div>
            <h3 className="text-muted mb-2">ไม่พบภาพกิจกรรม</h3>
            <p className="text-muted">
              ขออภัย ไม่สามารถโหลดภาพกิจกรรมได้ในขณะนี้
            </p>
            <button className="btn btn-primary mt-3" onClick={fetchPhotosData}>
              <i className="fas fa-refresh me-2"></i>
              ลองใหม่
            </button>
          </div>
        ) : (
          <>
            <div className="row gy-4 mb-5">
              {photos.map((photo) => (
                <div
                  className={`${isMobile ? "col-6" : "col-lg-3 col-md-4"}`}
                  key={photo.Id}
                >
                  <div
                    className="card h-100 shadow-sm hover-shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="card-img-top overflow-hidden position-relative"
                      style={{ height: "200px" }}
                    >
                      {photo.Cover && (
                        <Image
                          src={photo.Cover}
                          alt={`อัลบั้ม: ${photo.Title}`}
                          width={400}
                          height={200}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "0.375rem 0.375rem 0 0",
                            transition: "transform 0.3s ease",
                          }}
                          className="img-fluid"
                          priority={false}
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                        />
                      )}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          background: "rgba(0,0,0,0)",
                          transition: "background 0.3s ease",
                          opacity: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(0,0,0,0.2)";
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,0,0,0)";
                          e.currentTarget.style.opacity = "0";
                        }}
                      >
                        <i className="fas fa-eye text-white fs-3"></i>
                      </div>
                    </div>

                    <div className="card-body text-center p-3">
                      <h5 className="card-title text-uppercase mb-2 text-truncate">
                        {photo.Title}
                      </h5>
                      <small className="text-muted">
                        คลิกเพื่อดูภาพทั้งหมด
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-5 pt-4 border-top">
              <Pagination
                count={Math.ceil(totalRows / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
              />
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .hover-shadow-lg:hover {
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }

        .transition-shadow {
          transition: box-shadow 0.15s ease-in-out;
        }
      `}</style>
    </section>
  );
}
