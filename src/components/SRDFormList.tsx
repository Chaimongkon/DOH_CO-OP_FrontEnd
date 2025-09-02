import React from "react";
import Lottie from 'lottie-react';
import { DownloadForm } from "@/types";
import { SRDFormItem } from "./SRDFormItem";
import animationData from "../app/File.json";

interface SRDFormListProps {
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
   * Icon filename (e.g., "icon.png", "icon2.png", "icon3.png")
   */
  iconImage: string;
  /**
   * Handler for PDF click
   */
  onPdfClick: (formItem: DownloadForm) => void;
  /**
   * Icon width (default: 70)
   */
  iconWidth?: number;
  /**
   * Icon height (default: 70)
   */
  iconHeight?: number;
}

/**
 * Form list component with loading, error, and empty states
 */
export const SRDFormList: React.FC<SRDFormListProps> = ({
  loading,
  error,
  groupedForms,
  iconImage,
  onPdfClick,
  iconWidth = 70,
  iconHeight = 70,
}) => {
  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true} 
          style={{ height: 150, width: 150 }} 
        />
      </div>
    );
  }

  if (Object.keys(groupedForms).length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">ไม่พบข้อมูลในขณะนี้</p>
        {error && (
          <div className="alert alert-warning mt-3">
            <strong>ข้อผิดพลาด:</strong> {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="row gy-4">
      {Object.entries(groupedForms).map(
        ([typeMember, memberForms], columnIndex) => (
          <div className="col-lg-12" key={columnIndex}>
            <h3 className="text-uppercase lined mb-4">{typeMember}</h3>
            <ul className="list-unstyled">
              {memberForms.map((formItem: DownloadForm) => (
                <SRDFormItem
                  key={formItem.id}
                  formItem={formItem}
                  iconImage={iconImage}
                  onPdfClick={onPdfClick}
                  iconWidth={iconWidth}
                  iconHeight={iconHeight}
                />
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default SRDFormList;