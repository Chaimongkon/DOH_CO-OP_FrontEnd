import React from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Image from "next/image";
import styles from "@/styles/ApplicationGallery.module.css";
import ApplicationLoading from "@/components/ApplicationLoading";
import InstallErrorBoundary from "@/components/InstallErrorBoundary";
import { useApplicationImages } from "@/hooks/useApplicationImages";
import animationData from "../app/loading4.json";

interface ApplicationGalleryProps {
  filterType: string;
  altTextPrefix: string;
  componentName?: string;
  endpoint?: string;
}

const ApplicationGallery: React.FC<ApplicationGalleryProps> = ({
  filterType,
  altTextPrefix,
  componentName = "คู่มือแอปพลิเคชั่น",
  endpoint = "/Application"
}) => {
  const { 
    app, 
    imagesWithDimensions, 
    lightboxImages, 
    loading, 
    error, 
    retryFetch,
    lightboxIndex,
    handleImageClick,
    handleCloseLightbox,
    handleKeyDown
  } = useApplicationImages(endpoint, filterType);

  if (loading) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <ApplicationLoading animationData={animationData} />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
              <p>{error}</p>
              <hr />
              <button className="btn btn-primary" onClick={retryFetch}>
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <InstallErrorBoundary>
      <section className="py-5">
        <div className="container py-4">
          {app.length > 0 && (
            <header className="mb-5">
              <h1 className="text-uppercase lined mb-4">{app[0].title}</h1>
              <p className="lead">{app[0].detail}</p>
            </header>
          )}
          
          <div className="row gy-4">
            <div className="col-12">
              {imagesWithDimensions.length > 0 ? (
                <div className={styles.photoGrid}>
                  {imagesWithDimensions.map((photo, idx) => (
                    <div 
                      key={`image-${idx}`}
                      className={styles.photoItem}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleImageClick(idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      aria-label={`ดูรูปภาพที่ ${idx + 1} ใน lightbox`}
                    >
                      <Image
                        src={photo.src}
                        alt={`${altTextPrefix} ${idx + 1}: ${app[0]?.title || componentName}`}
                        className={styles.photoImage}
                        width={photo.width}
                        height={photo.height}
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          borderRadius: "10px",
                          cursor: "pointer",
                        }}
                        priority={idx < 2}
                        onError={() => {
                          // Image load error is already handled by the custom hook
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">ไม่มีรูปภาพให้แสดง</p>
                </div>
              )}
            </div>
          </div>

          {lightboxImages.length > 0 && (
            <Lightbox
              index={lightboxIndex}
              slides={lightboxImages}
              open={lightboxIndex >= 0}
              close={handleCloseLightbox}
            />
          )}
        </div>
      </section>
    </InstallErrorBoundary>
  );
};

export default ApplicationGallery;