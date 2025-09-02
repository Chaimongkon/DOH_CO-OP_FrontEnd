import React from "react";
import Lottie from 'lottie-react';
import { DownloadForm } from "@/types";
import animationData from "../app/loading2.json";

interface DownloadFormPageProps {
  /**
   * Loading state
   */
  loading: boolean;
  /**
   * Error state
   */
  error: string | null;
  /**
   * Grouped forms by member type
   */
  groupedForms: { [key: string]: DownloadForm[] };
  /**
   * Handler for PDF click
   */
  onPdfClick: (formItem: DownloadForm) => void;
  /**
   * Refetch function for retrying
   */
  onRefetch: () => void;
  /**
   * Form label for messages
   */
  formLabel: string;
}

/**
 * Shared download form page component
 */
export const DownloadFormPage: React.FC<DownloadFormPageProps> = ({
  loading,
  error,
  groupedForms,
  onPdfClick,
  onRefetch,
  formLabel,
}) => {
  // Loading state
  if (loading) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <div className="loading-container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
            <Lottie 
              animationData={animationData} 
              loop={true} 
              autoplay={true} 
              style={{ height: 150, width: 150 }} 
            />
            <p className="mt-3 text-muted">กำลังโหลด{formLabel}...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center" style={{ minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">เกิดข้อผิดพลาด</h4>
              <p>{error}</p>
              <hr />
              <button 
                className="btn btn-outline-danger" 
                onClick={onRefetch}
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (Object.keys(groupedForms).length === 0) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center" style={{ minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">ไม่พบข้อมูล</h4>
              <p>ขณะนี้ยังไม่มี{formLabel}</p>
              <button 
                className="btn btn-outline-info" 
                onClick={onRefetch}
              >
                รีเฟรช
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Forms display
  return (
    <section className="py-5">
      <div className="container py-4">
        <div className="row gy-4">
          {Object.entries(groupedForms).map(
            ([typeMember, memberForms], columnIndex) => (
              <div className="col-lg-4" key={columnIndex}>
                <h3 className="text-uppercase lined mb-4">{typeMember}</h3>
                <ul className="list-unstyled">
                  {memberForms.map((formItem: DownloadForm) => (
                    <li className="d-flex mb-3 form-item" key={formItem.id}>
                      <div
                        className="icon-filled2 me-3"
                        style={{ 
                          width: "40px",
                          height: "40px",
                          minWidth: "40px",
                          minHeight: "40px",
                          maxWidth: "40px",
                          maxHeight: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                          flexShrink: 0
                        }}
                        onClick={() => onPdfClick(formItem)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <i className="fas fa-download icon-shadow icon-3d"></i>
                      </div>
                      <div className="flex-grow-1">
                        <button
                          onClick={() => onPdfClick(formItem)}
                          className="btn btn-link p-0 text-start text-decoration-none"
                          style={{ 
                            color: "inherit",
                            fontSize: "inherit",
                            fontWeight: "inherit"
                          }}
                          aria-label={`ดาวน์โหลด ${formItem.title}`}
                        >
                          <p className="text-sm312 mb-0 hover-underline">
                            {formItem.title}
                          </p>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default DownloadFormPage;