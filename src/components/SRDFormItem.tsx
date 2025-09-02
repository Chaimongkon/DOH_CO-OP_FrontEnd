import React from "react";
import Image from "next/image";
import { DownloadForm } from "@/types";

interface SRDFormItemProps {
  /**
   * Form item data
   */
  formItem: DownloadForm;
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
 * Individual form item component for SRD pages
 */
export const SRDFormItem: React.FC<SRDFormItemProps> = ({
  formItem,
  iconImage,
  onPdfClick,
  iconWidth = 70,
  iconHeight = 70,
}) => {
  return (
    <li className="d-flex mb-32">
      <div
        className="icon-filled3 me-2"
        style={{ 
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
          minWidth: `${iconWidth}px`,
          minHeight: `${iconHeight}px`
        }}
      >
        <Image
          className="img-fluid cursor-pointer icon-shadow icon-3d"
          src={`/image/ImageMenu/${iconImage}`}
          alt="Open PDF"
          width={iconWidth}
          height={iconHeight}
          style={{
            maxWidth: "100%",
            height: "auto"
          }}
          sizes="(max-width: 768px) 50px, 70px"
          onClick={() => onPdfClick(formItem)}
        />
      </div>
      <div
        onClick={() => onPdfClick(formItem)}
        className="cursor-pointer"
      >
        <p className="text-sm32 mb-0">{formItem.title}</p>
      </div>
    </li>
  );
};

export default SRDFormItem;